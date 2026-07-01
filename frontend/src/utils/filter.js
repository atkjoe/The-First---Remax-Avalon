export function paginate(items, page, perPage) {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

export function pageCount(items, perPage) {
  return Math.max(1, Math.ceil(items.length / perPage));
}
