# ITCraft ONE V4 — Topology Transformation

This build changes ITCraft ONE from a generic circuit into the network-component visual language shown in the supplied 3D topology reference.

## Run

```sh
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked by the execution policy:

```powershell
npm.cmd install
npm.cmd run dev
```

This does not require changing PowerShell's execution policy.

## Journey
1. Live topology — Internet > Firewall > Router > Switch > Servers/NAS/APs/Endpoints.
2. PrismSuite — animated scan pulse traverses the circuit; findings attach to affected assets.
3. ProjectOne — firewall rules are reconfigured and segmented VLAN zones appear over the same topology.
4. Aegis One — SOC/NOC telemetry, security incident management, and service health monitoring activate.
5. Phoenix ODR — primary application is taken offline and a recovery workload appears.

All network hardware is procedural R3F geometry based on the visual component style in the user's supplied topology screenshot; no GLTF/OBJ dependencies are required. Product/company marks use the supplied logo files.

## Interactive threat simulation

Controls and the event feed sit beside the topology (below it on mobile), so no information panel covers the network. A simulated ransomware stream starts automatically; use the threat selector to switch to malware or Stop / Launch to control the stream.

Initiate PrismSuite to scan and detect exposure, then initiate Project One to reconfigure firewall policies and segment the network. The next standard attack stops outside the firewall, before Aegis is activated. Activate Aegis One to connect SOC/NOC monitoring: telemetry flows to a monitoring hub, security events become tracked incidents, and the service health panel reflects workload availability. Aegis observes enforcement without changing the packet route. Operations show progress, animation, and timestamped events; assessment takes eight seconds and the infrastructure upgrade takes twelve. Completed layers stay active while browsing the journey tabs. Phoenix ODR runs a separate outage and recovery drill monitored by NOC.

Each 12-second attack attempt starts from a fresh simulated workload. Completing a defense starts a new attempt using the updated protection. Reset demo clears all layers and cancels an operation in progress. All traffic, findings, scores, and attacks are illustrative; no live network is scanned or attacked.

Use **Attack scenario** to distinguish firewall interception from a perimeter bypass drill. Before Project One completes, all scenarios allow the simulated threat to cross the firewall and reach the server; PrismSuite detects exposure without blocking it. **Firewall interception** stays disabled during reconfiguration and unlocks only when Project One completes. The simulation also enforces this prerequisite for stale or forced selections. Interception then stops the red packet outside the firewall with a shield and impact ripple. The optional bypass drill deliberately crosses the hardened perimeter to test internal detection and segmentation. Aegis adds monitoring and incident management to both scenarios. This is an illustrative before/after comparison, not a claim that every real-world firewall permits threats without Project One.

## Visible infrastructure transformation

The threat selector also changes the animated payload: ransomware uses a red padlock with a pulsing square outline; malware uses an amber rotating spiked bug with a broken circular orbit. A moving label, legend icon, and selector preview identify the design. Both follow the same simulation rules and retain their threat colour when blocked; the green outer effect indicates interception.

The starting topology uses a basic unmanaged switch, a Windows desktop hosting the application, an external USB drive for manual backup copies, unreviewed firewall rules, an unsegmented network, and basic antivirus / Windows Defender on the endpoints. PrismSuite takes eight seconds to scan the connected assets and progressively reveal six illustrative findings. The backup finding is manual copies without a central schedule. The endpoint finding is missing centrally managed EDR/XDR, rather than a claim that Windows Defender is inherently low quality. A comparison panel below the canvas keeps the original condition, finding and target state visible without covering the topology.

Project One takes twelve seconds: stage firewall policies, replace the switch, introduce VLANs, then migrate to dedicated server infrastructure, replace the external backup disk with NAS storage and scheduled backup jobs, deploy managed EPS with EDR/XDR across 24 endpoints, and activate enforcement. The backup connection changes from a USB attachment on the host to a network link on the switch. Endpoints change from amber basic-protection shields to green shield checks. Aegis subsequently connects their telemetry to the SOC/NOC hub. Models animate into place; each finding changes from identified to upgrading to resolved. NAS deployment, firewall and managed endpoint protection activate only when the operation completes. Reset restores the external backup disk, original hardware, basic endpoint antivirus, and unassessed state. The demo does not claim certification against a particular configuration standard.

## Verification

```powershell
node --test src/simulation.test.mjs
node --test src/transformation.test.mjs
npm.cmd run build
```

The optional Windows browser check uses locally installed Microsoft Edge and a running development server. It saves screenshots under `artifacts/`:

```powershell
$env:TEST_URL = 'http://127.0.0.1:5173'
node scripts/browser-check.mjs
```
