<script setup>
// Não precisamos importar LoginPage ou HelloWorld aqui se eles são gerenciados pelo router
// ou não são usados diretamente neste template.
</script>

<template>
  <router-view />
</template>

<style scoped>
/* Seus estilos atuais do App.vue. Você pode mantê-los ou ajustá-los.
   Os estilos para 'header', 'nav', etc., podem não ser relevantes
   se App.vue agora só contém <router-view /> e a LoginPage cuida do seu próprio layout.
   Considere se esses estilos devem ir para um componente de Layout específico
   ou para dentro da LoginPage se forem exclusivos dela. */

/* Vou manter seus estilos aqui por enquanto, mas avalie a necessidade deles neste arquivo. */
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>