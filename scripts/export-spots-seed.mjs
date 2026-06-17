import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const spotSources = [
  { cityCode: 'sapporo', file: 'src/data/spots/sapporo.ts', exportName: 'SAPPORO_FOOD_LIST' },
  { cityCode: 'otaru', file: 'src/data/spots/otaru.ts', exportName: 'OTARU_FOOD_LIST' },
  { cityCode: 'tokyo', file: 'src/data/spots/tokyo.ts', exportName: 'TOKYO_FOOD_LIST' },
  { cityCode: 'osaka', file: 'src/data/spots/osaka.ts', exportName: 'OSAKA_FOOD_LIST' },
];

function readStringLiteral(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return '';
}

function readSpotObject(node) {
  const spot = {};

  node.properties.forEach((property) => {
    if (!ts.isPropertyAssignment(property)) return;
    const key = property.name?.text;
    if (!key) return;
    spot[key] = readStringLiteral(property.initializer);
  });

  return spot;
}

function findSpotArray(sourceFile, exportName) {
  let spots = [];

  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;

    node.declarationList.declarations.forEach((declaration) => {
      if (declaration.name?.text !== exportName || !ts.isArrayLiteralExpression(declaration.initializer)) {
        return;
      }

      spots = declaration.initializer.elements
        .filter((element) => ts.isObjectLiteralExpression(element))
        .map(readSpotObject);
    });
  });

  return spots;
}

function sqlString(value) {
  if (value === undefined || value === null) return 'null';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function spotToValues(cityCode, spot, index) {
  return [
    sqlString(spot.id),
    sqlString(cityCode),
    sqlString(spot.category),
    sqlString(spot.name),
    sqlString(spot.rating),
    sqlString(spot.menu),
    sqlString(spot.tips),
    sqlString(spot.address),
    sqlString(spot.openTime),
    sqlString(spot.closeTime),
    String((index + 1) * 10),
  ].join(', ');
}

const rows = [];

spotSources.forEach(({ cityCode, file, exportName }) => {
  const absolutePath = path.join(rootDir, file);
  const sourceText = fs.readFileSync(absolutePath, 'utf8');
  const sourceFile = ts.createSourceFile(absolutePath, sourceText, ts.ScriptTarget.Latest, true);
  const spots = findSpotArray(sourceFile, exportName);

  spots.forEach((spot, index) => {
    rows.push(`  (${spotToValues(cityCode, spot, index)})`);
  });
});

if (rows.length === 0) {
  throw new Error('No spots found to export.');
}

console.log(`insert into public.spots (
  id,
  city_code,
  category,
  name,
  rating,
  menu,
  tips,
  address,
  open_time,
  close_time,
  sort_order
)
values
${rows.join(',\n')}
on conflict (id) do update set
  city_code = excluded.city_code,
  category = excluded.category,
  name = excluded.name,
  rating = excluded.rating,
  menu = excluded.menu,
  tips = excluded.tips,
  address = excluded.address,
  open_time = excluded.open_time,
  close_time = excluded.close_time,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();
`);
