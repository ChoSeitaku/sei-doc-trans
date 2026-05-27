export function generateGlossaryYaml(): string {
  return `# github-global Glossary
# Define terms that must be translated consistently.
#
# Example:
# - source: "大模型"
#   en: "LLM"
#   ja: "大規模言語モデル"
#   ko: "거대 언어 모델"
#
# - source: "提示词"
#   en: "prompt"
#   ja: "プロンプト"
#
# - source: "智能体"
#   en: "agent"
#   context: "AI agent context, not HTTP proxy"
#
# Add your project-specific terms below:

[]
`;
}
