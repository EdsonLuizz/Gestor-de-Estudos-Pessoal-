#!/usr/bin/env python3
"""
plot_k6_all.py – Gera gráficos PNG de série temporal para métricas do k6
(arquivo LD-JSON gerado com --out json=...).

Uso:
    python plot_k6_all.py resultado_ldjson.json [metrica1 metrica2 …]

Se nenhuma métrica for passada, o script detecta todas as disponíveis
(excluindo 'vus').
"""

import sys, json, itertools
from pathlib import Path
from collections import defaultdict
from dateutil import parser as dtparse

import pandas as pd
import matplotlib.pyplot as plt

# ---------------------------------------------------------------------------
# Métricas que devem ser AGREGADAS COMO CONTADOR (count por segundo)
COUNTER_METRICS = {"http_reqs", "iterations", "checks", "throughput"}

# Títulos legíveis (adicione conforme necessário)
FRIENDLY_NAME = {
    "http_req_duration": "Duração média das requisições ao longo do tempo",
    "http_req_waiting": "Tempo de waiting (TTFB) ao longo do tempo",
    "http_req_blocked": "Tempo de blocked (fila) ao longo do tempo",
    "http_req_connecting": "Tempo de connecting ao longo do tempo",
    "http_req_sending": "Tempo de envio (sending) ao longo do tempo",
    "http_req_receiving": "Tempo de recebimento ao longo do tempo",
    "iterations": "Iterações por segundo ao longo do tempo",
    "http_reqs": "Requisições HTTP por segundo ao longo do tempo",
    "throughput": "Throughput (req/s) ao longo do tempo",
}

# ---------------------------------------------------------------------------
def is_ldjson(first_lines) -> bool:
    """Detecta se o arquivo parece LD-JSON (um objeto por linha)."""
    for ln in first_lines:
        ln = ln.strip()
        if ln.startswith("{") and ln.endswith("}"):
            try:
                obj = json.loads(ln)
                if obj.get("type") == "Point":
                    return True
            except json.JSONDecodeError:
                pass
    return False


def read_ldjson(path: Path):
    """Lê LD-JSON → dict de pontos por métrica + lista de VUs."""
    metrics = defaultdict(list)   # {metric: [(ts,val,tags?)]}
    vus_points = []               # [(ts, val)]

    with path.open(encoding="utf-8") as f:
        for ln in f:
            ln = ln.strip()
            if not (ln.startswith("{") and ln.endswith("}")):
                continue
            try:
                obj = json.loads(ln)
            except json.JSONDecodeError:
                continue
            if obj.get("type") != "Point":
                continue

            m = obj["metric"]
            ts = dtparse.isoparse(obj["data"]["time"])
            val = obj["data"]["value"]
            tags = obj["data"].get("tags", {})

            metrics[m].append((ts, val, tags))
            if m == "vus":
                vus_points.append((ts, val))  # só 2 colunas
    return metrics, vus_points


def build_series(points, base_ts, agg="mean"):
    """
    Converte lista de pontos em Series por segundo.
    * agg='mean'  → média
    * agg='count' → número de eventos
    Aceita tuplas com 2 ou 3 colunas.
    """
    if not points:
        return pd.Series(dtype=float)

    # Normaliza para dict {'ts':..., 'val':...}
    rows = [{"ts": p[0], "val": p[1]} for p in points]
    df = pd.DataFrame(rows)
    df["sec"] = (df["ts"] - base_ts).dt.total_seconds().astype(int)

    if agg == "count":
        return df.groupby("sec")["val"].size()
    return df.groupby("sec")["val"].mean()


def friendly(metric: str) -> str:
    """Retorna título amigável."""
    return FRIENDLY_NAME.get(metric,
            metric.replace("_", " ").title() + " ao longo do tempo")


def plot_metric(metric, title, metric_df, vus_df=None):
    """Desenha e salva PNG de uma métrica."""
    # Evita erro de quantile em séries vazias
    if metric_df.empty:
        print(f"⚠️  Métrica {metric} sem dados – ignorada.")
        return

    # Para contadores (count), p95 / p99 não fazem muito sentido,
    # mas calculamos para manter consistência visual
    p95, p99 = metric_df.quantile([0.95, 0.99])

    fig, ax1 = plt.subplots(figsize=(14, 7), dpi=120)

    ax1.plot(metric_df.index, metric_df.values, lw=2, color="tab:orange",
             label=f"{metric} (avg/s)" if metric not in COUNTER_METRICS else f"{metric} (count/s)")

    ax1.axhline(p95, color="gold", ls="--", lw=2, label="p95")
    ax1.axhline(p99, color="red",  ls=":",  lw=2, label="p99")

    # Grade quadriculada tracejada
    ax1.grid(which="both", linestyle="--", linewidth=0.5, alpha=0.5)

    ax1.set_xlabel("Tempo (s)")
    ax1.set_ylabel(metric, color="tab:orange")
    ax1.tick_params(axis="y", labelcolor="tab:orange")

    # Concorrência
    if vus_df is not None and not vus_df.empty:
        ax2 = ax1.twinx()
        ax2.fill_between(vus_df.index, vus_df.values,
                         color="lightgrey", alpha=0.4,
                         label="Concorrência (VUs)")
        ax2.set_ylabel("VUs", color="grey")
        ax2.tick_params(axis="y", labelcolor="grey")

    plt.title(title, fontsize=15, fontweight="bold")

    # Combina legendas
    lines, labels = ax1.get_legend_handles_labels()
    if vus_df is not None and not vus_df.empty:
        l2, lb2 = ax2.get_legend_handles_labels()
        lines += l2
        labels += lb2
    ax1.legend(lines, labels, loc="upper right")

    out_png = f"{metric}_timeseries.png"
    plt.tight_layout()
    plt.savefig(out_png)
    plt.close()
    print(f"✅ {out_png}")


# ---------------------------------------------------------------------------
def main():
    if len(sys.argv) < 2:
        sys.exit("Uso: python plot_k6_all.py arquivo.json [metrica1 metrica2 …]")

    json_path = Path(sys.argv[1])
    metrics_cli = sys.argv[2:]  # pode ser vazio

    # Verifica LD-JSON
    with json_path.open(encoding="utf-8") as f:
        if not is_ldjson(list(itertools.islice(f, 5))):
            sys.exit("⚠️  Arquivo não é LD-JSON. Gere com:\n"
                     "    k6 run … --out json=resultado_ldjson.json")

    metrics, vus_points = read_ldjson(json_path)

    metrics_to_plot = metrics_cli or [m for m in metrics if m != "vus"]

    # Timestamp base (primeiro ponto do primeiro metric)
    base_ts = min(ts for m in metrics_to_plot if m in metrics
                     for ts, *_ in metrics[m])

    vus_df = build_series(vus_points, base_ts, agg="count") if vus_points else None

    for metric in metrics_to_plot:
        if metric not in metrics:
            print(f"⏩ Métrica '{metric}' inexistente, ignorando.")
            continue

        agg = "count" if metric in COUNTER_METRICS else "mean"
        metric_df = build_series(metrics[metric], base_ts, agg=agg)
        plot_metric(metric, friendly(metric), metric_df, vus_df)


if __name__ == "__main__":
    import itertools  # usado para pré-leitura de 5 linhas
    main()
