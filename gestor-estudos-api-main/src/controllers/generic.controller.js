import redis from '../config/redis.js';

export const makeCrud = (Model) => {
  const baseKey = Model.tableName || Model.name.toLowerCase();

  return {
    async create(req, res) {
      try {
        const data = await Model.create(req.body);
        // Invalida cache da lista após criar
        await redis.del(`${baseKey}:all`);
        return res.status(201).json(data);
      } catch (e) {
        return res.status(400).json({ msg: e.message });
      }
    },

    async findAll(req, res) {
      const cacheKey = `${baseKey}:all`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.json(JSON.parse(cached));
        }
        const data = await Model.findAll();
        // TTL de 5 min
        await redis.set(cacheKey, JSON.stringify(data), { EX: 300 });
        return res.json(data);
      } catch (e) {
        return res.status(500).json({ msg: e.message });
      }
    },

    async findById(req, res) {
      const { id } = req.params;
      const cacheKey = `${baseKey}:${id}`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.json(JSON.parse(cached));
        }
        const data = await Model.findByPk(id);
        if (!data) return res.sendStatus(404);
        await redis.set(cacheKey, JSON.stringify(data), { EX: 300 });
        return res.json(data);
      } catch (e) {
        return res.status(500).json({ msg: e.message });
      }
    },

    async update(req, res) {
      const { id } = req.params;
      try {
        const data = await Model.findByPk(id);
        if (!data) return res.sendStatus(404);
        await data.update(req.body);
        await redis.del(`${baseKey}:all`, `${baseKey}:${id}`);
        return res.json(data);
      } catch (e) {
        return res.status(400).json({ msg: e.message });
      }
    },

    async remove(req, res) {
      const { id } = req.params;
      try {
        const data = await Model.findByPk(id);
        if (!data) return res.sendStatus(404);
        await data.destroy();
        await redis.del(`${baseKey}:all`, `${baseKey}:${id}`);
        return res.sendStatus(204);
      } catch (e) {
        return res.status(500).json({ msg: e.message });
      }
    }
  };
};
