// Secret Santa assignment that respects "X must not draw Y" rules.
// Returns giver -> receiver, or null when the rules make a draw impossible.

function rand(n: number) {
  return Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * n);
}
function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function attempt(ids: string[], banned: Set<string>, noMutual: boolean, budget: { n: number }) {
  const allowed = new Map<string, string[]>();
  for (const g of ids) allowed.set(g, ids.filter((r) => r !== g && !banned.has(`${g}>${r}`)));
  if ([...allowed.values()].some((l) => !l.length)) return null;
  // Most constrained givers first; ties broken randomly.
  const order = shuffle([...ids]).sort((a, b) => allowed.get(a)!.length - allowed.get(b)!.length);
  const taken = new Set<string>();
  const out = new Map<string, string>();
  const step = (i: number): boolean => {
    if (i === order.length) return true;
    if (--budget.n < 0) return false;
    const g = order[i];
    for (const r of shuffle([...allowed.get(g)!])) {
      if (taken.has(r)) continue;
      if (noMutual && out.get(r) === g) continue;
      taken.add(r); out.set(g, r);
      if (step(i + 1)) return true;
      taken.delete(r); out.delete(g);
    }
    return false;
  };
  return step(0) ? out : null;
}

export function drawPairs(ids: string[], rules: { giver_id: string; receiver_id: string }[]) {
  const set = new Set(ids);
  const banned = new Set(rules.filter((x) => set.has(x.giver_id) && set.has(x.receiver_id)).map((x) => `${x.giver_id}>${x.receiver_id}`));
  // Prefer no "A gives to B and B gives to A" when the group is big enough.
  if (ids.length >= 4) {
    const r = attempt(ids, banned, true, { n: 50000 });
    if (r) return r;
  }
  return attempt(ids, banned, false, { n: 200000 });
}
