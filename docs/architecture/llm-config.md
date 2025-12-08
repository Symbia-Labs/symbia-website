# LLM Configuration Layers (OpenAI-compatible defaults)

## Layering
- **Repo defaults** (`daemon/core/config/system.yaml`): define generic `llm_providers.openai` with base URL/path/model and blank headers (no secrets).
- **System override** (`system.yaml` in state) and **user overrides** (`daemon/core/config/user.yaml`): override base_url/model/api_version/headers. Secrets should come from env (e.g., `OPENAI_API_KEY`).
- **Env vars**: `OPENAI_API_KEY`, `OPENAI_API_BASE`, `OPENAI_MODEL` can override at runtime; reflection/chat workers also honor their own plugin/env configs.

## OpenAI provider fields
- `base_url`: default `https://api.openai.com/v1` (override for Azure/gateway).
- `chat_path`: default `/chat/completions`.
- `default_model`: default `gpt-4o-mini`.
- `api_version`: blank by default; set if required (e.g., Azure OpenAI).
- `headers.Authorization`: blank in repo; set via env `OPENAI_API_KEY` (preferred).

## How it’s used today
- `/chat` pulls provider/base/model from `settings.chat.provider` (and env) and supports openai/anthropic/ollama/subkeys; the `llm_providers` block keeps provider-specific details portable for future wiring.
- Reflection worker LLM plugin uses its own config/env (`reflection.llm.plugin`), independent of chat.

## Defaults
- Repo: safe/offline defaults (no keys).
- User: inherits system and may set `llm_providers.openai.base_url/model/api_version/headers.Authorization` but should prefer env for secrets.

## Future wiring
- Bind `/chat` provider selection to `llm_providers.<name>` to fully abstract provider details.
- Add adapters for other providers (Anthropic/Azure/OpenAI gateways) under `llm_providers` with their OpenAPI paths/headers.
