const express = require("express");

const app = express();

const { people } = require("./models");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  req.method !== "OPTIONS" ? next() : res.status(200).end();
});

const rawAttributes = Object.keys(people.rawAttributes).map((col) => ({
  dataKey: people.rawAttributes[col].field,
  label: people.rawAttributes[col].field,
  type: people.rawAttributes[col].type.constructor.name,
  values:
    people.rawAttributes[col].type.constructor.name == "ENUM"
      ? col.value
      : null,
}));

app.get("/cols", (req, res) => res.json(rawAttributes));

app.use(express.json());
app.post("/data", (req, res) =>
  people
    .findAll({
      where: req.body.where,
      limit: req.body.limit,
      offset: req.body.offset,
      order: req.body.order,
      attributes: req.body.visible,
    })
    .then((rows) => res.json(rows))
    .catch((err) => res.status(500).end())
);

app.listen(3000);
