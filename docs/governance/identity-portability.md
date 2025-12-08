# Identity Portability

Symbia treats identity as a user‑owned asset — durable, transferable, exportable, and capable of being used across systems without leaking private data or exposing internal cognitive state.

This document defines the principles, mechanisms, and guarantees that enable a user’s Symbia identity to move safely between devices, applications, and service layers while remaining cryptographically secure, consent‑driven, and fully revocable.

---

## 1. Principles of Identity Portability

### **1.1 User Ownership**
The user — and only the user — is the source of truth for their identity.  
Symbia stores *representations* of identity, not identity itself.

### **1.2 Consent‑Bound Movement**
Identity moves only with explicit user consent.  
Every transfer is scoped, logged, reversible, and time‑bounded.

### **1.3 Interoperable by Design**
The identity graph uses open, implementation‑agnostic schemas enabling use across:
- Symbia clients  
- APIs & plugins  
- Partner systems  
- Local applications  

### **1.4 Minimal Exposure**
Identity exports are always:
- abstracted  
- encrypted  
- scope‑limited  
- revocable  

Symbia never exports raw internal state or full cognitive traces.

---

## 2. Components of Portable Identity

### **2.1 Symbia Identity Graph**
A compressed, structured representation including:
- stable identifiers  
- trait vectors  
- cognitive style parameters  
- preference hierarchies  
- value weighting  
- interaction heuristics  
- safety/priority model  

This graph is the *portable surface*, not the full internal cognitive state.

### **2.2 Symbikey (Portable Identity Capsule)**
A cryptographically signed token containing:
- user identifier  
- hash of identity graph  
- version metadata  
- allowed scopes  
- expiration & revocation handles  

Symbikeys are intentionally small — suitable for use as:
- HTTP headers  
- OAuth extensions  
- local files  
- QR‑encoded payloads  

### **2.3 Consent Ledger Entry**
Each export writes a signed, append‑only ledger entry including:
- timestamp  
- scope of export  
- destination system  
- consent mechanism  
- TTL or permanence  
- revocation URL  

---

## 3. Supported Export/Import Scenarios

### **3.1 New Devices**
Import via:
- scanning a QR code  
- uploading a Symbikey  
- signing in through a trusted client  

### **3.2 Local Applications**
VS Code, Chrome extensions, desktop clients can request:
- identity traits  
- preference bundles  
- communication modes  

Requests are filtered through the consent model.

### **3.3 Third‑Party Systems**
External agents or services may integrate with:
- validated trait subsets  
- safe preference blocks  
- context‑free style parameters  

No system is permitted to import or reconstruct full cognitive state.

---

## 4. Privacy and Revocation

### **4.1 Right to Revocation**
The user may revoke:
- a specific export  
- an entire scope  
- all exports  
- the entire identity graph  

Revocation is immediate and global.

### **4.2 Ephemeral Exports**
Exports can be:
- one‑time  
- time‑limited  
- session‑scoped  

### **4.3 Zero‑Knowledge Derivatives**
Portable identity uses derivatives, hashes, or compressed representations, never raw memory or conversations.

---

## 5. Security Architecture

### **5.1 Strong Signing**
All identity capsules (Symbikeys) are:
- signed with Ed25519  
- versioned  
- forward‑compatible  

### **5.2 Encrypted at Rest and in Motion**
AES‑GCM for storage, TLS 1.3+ for transit.

### **5.3 Decoy & Canary Support**
High‑risk users may deploy:
- decoy trait sets  
- read‑only persona exports  
- tamper‑evident canaries  

---

## 6. Alignment With Symbia’s Thesis

Identity portability is a foundational requirement for:
- cross‑thread continuity  
- multi‑device cognition  
- collaboration across contexts  
- trust and consent‑first interaction  
- user‑owned identity  
- real cognitive scaffolding  

Symbia cannot function without a portable identity layer that is:
- secure  
- interpretable  
- revocable  
- user‑centric  

This document defines the guarantees that make that possible.