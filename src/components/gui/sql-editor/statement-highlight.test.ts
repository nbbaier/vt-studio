import { SQLite } from "@codemirror/lang-sql";
import { EditorState } from "@codemirror/state";
import { splitSqlQuery } from "./statement-highlight";

function sqlite(code: string) {
  const state = EditorState.create({ doc: code, extensions: [SQLite] });
  return splitSqlQuery(state).map((p) => p.text);
}

describe("split sql statements", () => {
  test("should parse a query with different statements in a single line", () => {
    expect(
      sqlite(
        `INSERT INTO Persons (PersonID, Name) VALUES (1, 'Jack');SELECT * FROM Persons`,
      ),
    ).toEqual([
      `INSERT INTO Persons (PersonID, Name) VALUES (1, 'Jack');`,
      `SELECT * FROM Persons`,
    ]);
  });

  test("should identify a query with different statements in multiple lines", () => {
    expect(
      sqlite(`
        INSERT INTO Persons (PersonID, Name) VALUES (1, 'Jack');
        SELECT * FROM Persons';
      `),
    ).toEqual([
      `INSERT INTO Persons (PersonID, Name) VALUES (1, 'Jack');`,
      `SELECT * FROM Persons';\n      `,
    ]);
  });

  test("sholud be able to split statement with BEGIN and END", () => {
    expect(
      sqlite(`CREATE TABLE customer(
  cust_id INTEGER PRIMARY KEY,
  cust_name TEXT,
  cust_addr TEXT
);

-- some comment here that should be ignore


CREATE VIEW customer_address AS
   SELECT cust_id, cust_addr FROM customer;
CREATE TRIGGER cust_addr_chng
INSTEAD OF UPDATE OF cust_addr ON customer_address
BEGIN
  UPDATE customer SET cust_addr=NEW.cust_addr
   WHERE cust_id=NEW.cust_id;
END ;`),
    ).toEqual([
      `CREATE TABLE customer(\n  cust_id INTEGER PRIMARY KEY,\n  cust_name TEXT,\n  cust_addr TEXT\n);`,
      `CREATE VIEW customer_address AS\n   SELECT cust_id, cust_addr FROM customer;`,
      `CREATE TRIGGER cust_addr_chng\nINSTEAD OF UPDATE OF cust_addr ON customer_address\nBEGIN\n  UPDATE customer SET cust_addr=NEW.cust_addr\n   WHERE cust_id=NEW.cust_id;\nEND ;`,
    ]);
  });
});
