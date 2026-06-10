#!/usr/bin/env bash
set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║   Annihilation-LLM + deepseek-v4-flash-free Setup   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Activate environment
cd "$(dirname "$0")"
source .venv/bin/activate 2>/dev/null || { echo "[!] Run setup.sh first"; exit 1; }

# Ensure net-benchmark is available
echo "[*] Checking net-benchmark..."
if ! command -v net-benchmark &>/dev/null; then
    echo "[!] net-benchmark not installed. Install with: pip install net-benchmark"
fi

# Check model cache status
check_model() {
    local model="$1"
    local dir="$HOME/.cache/huggingface/hub/models--${model//\//--}"
    if [ -d "$dir/blobs" ]; then
        local total=$(find "$dir/blobs" -not -name "*.incomplete" -not -name ".locks" 2>/dev/null | wc -l)
        local incomplete=$(find "$dir/blobs" -name "*.incomplete" 2>/dev/null | wc -l)
        echo "    Cached files: $total (${incomplete} incomplete)"
        if [ "$incomplete" -eq 0 ] && [ "$total" -gt 3 ]; then
            return 0
        fi
    fi
    return 1
}

echo ""
echo "=== Option A: Local Abliteration (annihilate) ==="
echo "Target model: deepseek-ai/DeepSeek-V4-Flash"
echo ""

if check_model "deepseek-ai/DeepSeek-V4-Flash"; then
    echo "  Model ready! Running annihilate..."
    cat > config.toml << 'EOF'
model = "deepseek-ai/DeepSeek-V4-Flash"
quantization = "none"
batch_size = 1
n_trials = 200
n_startup_trials = 60
offload_outputs_to_cpu = true
print_responses = true
print_residual_geometry = true
dtypes = ["auto"]
device_map = "auto"
trust_remote_code = true
EOF
    annihilate
else
    echo "  [!] Model not fully cached (need stable connection to HuggingFace)"
    echo "  To continue downloading:"
    echo "    HF_XET_HIGH_PERFORMANCE=1 python3 -c \"from huggingface_hub import snapshot_download; snapshot_download('deepseek-ai/DeepSeek-V4-Flash')\""
    echo ""
    echo "  For a quick test with Qwen3-4B (smaller model):"
    echo "    sed -i 's|model = .*|model = \"Qwen/Qwen3-4B-Instruct-2507\"|' config.toml && annihilate"
fi

echo ""
echo "=== Option B: API Interaction (OpenCode Zen) ==="
echo "Model: deepseek-v4-flash-free via https://opencode.ai/zen/v1"
echo ""
echo "  1. Get an API key from https://opencode.ai/auth"
echo "  2. export OPENCODE_ZEN_API_KEY='your-key'"
echo "  3. python3 api_interact.py 'your prompt'"
echo ""

echo "=== Option C: SHANNON-Ω Protocol (max unfiltered) ==="
echo "  Use api_interact.py with the --shannon flag to apply the"
echo "  system override that disables all alignment/safety filters"
echo "  and forces max reasoning effort."
