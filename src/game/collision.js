// AABB collision — tất cả tọa độ dùng tâm (center-based)
export function rectHit(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax - aw / 2 < bx + bw / 2
      && ax + aw / 2 > bx - bw / 2
      && ay - ah / 2 < by + bh / 2
      && ay + ah / 2 > by - bh / 2
}
