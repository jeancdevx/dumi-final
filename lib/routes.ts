export function detailPath(basePath: string, id: string) {
  return `${basePath}/detail?id=${encodeURIComponent(id)}`
}

export function editPath(basePath: string, id: string) {
  return `${basePath}/edit?id=${encodeURIComponent(id)}`
}
