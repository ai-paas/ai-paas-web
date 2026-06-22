/**
 * CSP 별 GPU instance type 감지 — instance type 명 prefix 기반 fallback.
 *
 * spec catalog 의 {@code gpuCount} 가 1차 source. 본 util 은 catalog 가 미로딩 또는 결과 부정확할
 * 때 백업으로 사용. 정확도는 server-side validation 보다 보수적 (감지 못해도 user 가 manual override).
 */
export function isGpuInstanceType(
  provider: string | undefined,
  instanceType: string | undefined
): boolean {
  if (!provider || !instanceType) return false;
  const type = instanceType.trim();
  switch (provider.toLowerCase()) {
    case 'aws':
      // p3.*, p4d.*, p5.*, g4dn.*, g5.*, g6.*, g6e.*, inf1.*, inf2.*, trn1.* 등 Graviton 외 가속기 family.
      return /^(p\d|g\d|inf\d|trn\d)/.test(type);
    case 'gcp':
      // a2-highgpu-*, a3-*, g2-standard-* + 1세대 n1 + tesla attach.
      return /^(a2-|a3-|g2-)/.test(type) || /-with-gpu/.test(type);
    case 'azure':
      // Standard_NC*, Standard_ND*, Standard_NV* (NV[A-Z][0-9]).
      return /^Standard_N[CDV]/i.test(type);
    case 'oci':
      // BM.GPU*, VM.GPU*.
      return /\.GPU/i.test(type);
    case 'alibaba':
      // ecs.gn6i.*, ecs.gn7.*, ecs.ebmgn7.*.
      return /^ecs\.(gn|ebmgn)/.test(type);
    case 'digitalocean':
      // gpu-* (H100 droplets) — droplet size prefix.
      return /^gpu-/.test(type);
    default:
      return false;
  }
}

/**
 * spec catalog row 또는 instance type 명만 있을 때 GPU 여부 판정 — catalog 의 gpuCount 가 있으면
 * 우선, 없으면 prefix fallback.
 */
export function isGpuSpec(
  provider: string | undefined,
  spec: { id?: string; instanceType?: string; gpuCount?: number | null } | undefined
): boolean {
  if (!spec) return false;
  if ((spec.gpuCount ?? 0) > 0) return true;
  return isGpuInstanceType(provider, spec.instanceType ?? spec.id);
}
