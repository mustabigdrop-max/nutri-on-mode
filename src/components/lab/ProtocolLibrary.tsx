import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Flame, Timer, Zap, Moon, Dna, Pill, Syringe, ChevronRight, BookOpen, FlaskConical } from "lucide-react";

const CATEGORIES = [
  { key: "hipertrofia", icon: Dumbbell, label: "Hipertrofia e Força", emoji: "💪" },
  { key: "emagrecimento", icon: Flame, label: "Emagrecimento e Cutting", emoji: "🔥" },
  { key: "endurance", icon: Timer, label: "Resistência e Endurance", emoji: "🏃" },
  { key: "performance", icon: Zap, label: "Performance e Energia", emoji: "⚡" },
  { key: "sono", icon: Moon, label: "Sono e Recuperação", emoji: "😴" },
  { key: "hormonal", icon: Dna, label: "Saúde Hormonal", emoji: "🧬" },
  { key: "suplementacao", icon: Pill, label: "Suplementação Avançada", emoji: "💊" },
  { key: "peptideos", icon: Syringe, label: "Peptídeos", emoji: "🧪" },
  { key: "anabolizantes", icon: FlaskConical, label: "Esteroides Anabolizantes", emoji: "⚗️" },
];

const SAMPLE_PROTOCOLS: Record<string, Array<{ titulo: string; nivel: string; tempo: number; resumo: string }>> = {
  hipertrofia: [
    { titulo: "Periodização de Carboidratos para Hipertrofia", nivel: "Avançado", tempo: 8, resumo: "Como manipular carboidratos ciclicamente para maximizar síntese proteica e minimizar ganho de gordura." },
    { titulo: "Protocolo de Proteína Peri-Treino", nivel: "Intermediário", tempo: 5, resumo: "Timing ideal de proteína antes, durante e após o treino baseado em meta-análises recentes." },
    { titulo: "Creatina: Guia Definitivo 2025", nivel: "Iniciante", tempo: 6, resumo: "Dosagem, timing, tipos e combinações de creatina com evidência atualizada." },
    { titulo: "Leucina e mTOR: Ativação da Síntese Proteica", nivel: "Avançado", tempo: 7, resumo: "Como otimizar a dose de leucina por refeição para máxima ativação de mTOR e MPS." },
  ],
  emagrecimento: [
    { titulo: "Deficit Inteligente sem Perda Muscular", nivel: "Intermediário", tempo: 7, resumo: "Como criar um deficit calórico que preserve massa magra usando estratégias de timing e macros." },
    { titulo: "Refeed e Diet Break Baseados em Ciência", nivel: "Avançado", tempo: 6, resumo: "Quando e como implementar refeeds e pausas na dieta para otimizar metabolismo." },
    { titulo: "Termogênese Adaptativa e Reversão Metabólica", nivel: "Avançado", tempo: 8, resumo: "Estratégias para combater a adaptação metabólica durante cortes prolongados." },
    { titulo: "Beta-Oxidação e L-Carnitina no Emagrecimento", nivel: "Intermediário", tempo: 6, resumo: "Como a L-carnitina facilita o transporte de ácidos graxos para beta-oxidação mitocondrial e seu impacto real na perda de gordura." },
  ],
  endurance: [
    { titulo: "Carb Loading Científico para Competição", nivel: "Intermediário", tempo: 6, resumo: "Protocolo de supercompensação de glicogênio baseado nos estudos mais recentes." },
    { titulo: "Hidratação e Eletrólitos em Provas Longas", nivel: "Iniciante", tempo: 5, resumo: "Taxas de reposição hídrica e eletrolítica durante exercícios de longa duração." },
    { titulo: "Periodização Nutricional para Endurance", nivel: "Avançado", tempo: 9, resumo: "Train-low, compete-high: como a periodização de carboidratos melhora eficiência metabólica." },
    { titulo: "Cafeína e Performance Aeróbica", nivel: "Intermediário", tempo: 5, resumo: "Dosagem ótima, timing e tolerância à cafeína para esportes de resistência." },
  ],
  performance: [
    { titulo: "Stack Pré-Treino Baseado em Evidência", nivel: "Intermediário", tempo: 6, resumo: "Combinação sinérgica de cafeína, citrulina, beta-alanina e taurina com doses otimizadas." },
    { titulo: "Nutrição Intra-Treino para Sessões Intensas", nivel: "Avançado", tempo: 5, resumo: "Quando e o que consumir durante treinos de alta intensidade >60 minutos." },
    { titulo: "Nitrato Dietético e Vasodilatação", nivel: "Intermediário", tempo: 5, resumo: "Como beterraba e fontes de nitrato melhoram eficiência de O2 e performance." },
    { titulo: "Adaptógenos para Performance: Ashwagandha e Rhodiola", nivel: "Avançado", tempo: 7, resumo: "Evidências clínicas sobre adaptógenos na performance física e recuperação do estresse." },
  ],
  sono: [
    { titulo: "Magnésio e Qualidade do Sono", nivel: "Iniciante", tempo: 4, resumo: "Formas de magnésio (bisglicinato, treonato), dosagem e timing para otimizar sono profundo." },
    { titulo: "Melatonina: Uso Correto e Limitações", nivel: "Intermediário", tempo: 5, resumo: "Dosagem cronobiológica de melatonina, quando usar e quando evitar." },
    { titulo: "Protocolo Nutricional para Insônia", nivel: "Avançado", tempo: 7, resumo: "Combinação de triptofano, glicina, tart cherry e manipulação de carboidratos noturnos." },
    { titulo: "Recuperação Muscular e Sono: Conexão Hormonal", nivel: "Intermediário", tempo: 6, resumo: "Como o sono regula GH, testosterona e cortisol para recuperação muscular ideal." },
  ],
  hormonal: [
    { titulo: "Nutrição para Otimização de Testosterona", nivel: "Intermediário", tempo: 7, resumo: "Micronutrientes essenciais (zinco, vitamina D, boro) e padrões alimentares que suportam níveis saudáveis de testosterona." },
    { titulo: "Tireoide e Metabolismo: Suporte Nutricional", nivel: "Avançado", tempo: 8, resumo: "Selênio, iodo e nutrientes que impactam a conversão T4→T3 e saúde tireoidiana." },
    { titulo: "Cortisol e Estresse: Manejo Nutricional", nivel: "Intermediário", tempo: 6, resumo: "Estratégias nutricionais para modular cortisol crônico elevado e seus efeitos metabólicos." },
    { titulo: "Protocolo Nutricional para Síndrome dos Ovários Policísticos", nivel: "Avançado", tempo: 8, resumo: "Inositol, cromo, dieta anti-inflamatória e estratégias baseadas em evidência para SOP." },
  ],
  suplementacao: [
    { titulo: "Vitamina D: Dose, Forma e Cofatores", nivel: "Iniciante", tempo: 5, resumo: "Dosagem ideal de vitamina D3 + K2, nível sérico alvo e interações com magnésio." },
    { titulo: "Ômega-3: EPA vs DHA e Dosagem Ideal", nivel: "Intermediário", tempo: 6, resumo: "Diferenças entre EPA e DHA, doses terapêuticas e qualidade do suplemento." },
    { titulo: "L-Carnitina e Beta-Oxidação: Guia Completo", nivel: "Intermediário", tempo: 7, resumo: "Mecanismo de ação da L-carnitina na oxidação de ácidos graxos, formas (L-carnitina, ALCAR, GPLC), dosagem e evidência clínica." },
    { titulo: "Stack de Longevidade: NMN, Resveratrol e Espermidina", nivel: "Avançado", tempo: 9, resumo: "Protocolos baseados nas pesquisas de Sinclair e estudos recentes sobre NAD+ e senescência." },
    { titulo: "Probióticos: Cepas Específicas por Objetivo", nivel: "Intermediário", tempo: 6, resumo: "Quais cepas probióticas têm evidência para cada objetivo: imunidade, humor, digestão, composição corporal." },
  ],
  peptideos: [
    { titulo: "BPC-157: Regeneração e Cicatrização", nivel: "Avançado", tempo: 8, resumo: "Mecanismo de ação do Body Protection Compound-157, estudos sobre cicatrização de tendões, músculos e mucosa gástrica. Dosagem, vias de administração e evidência pré-clínica." },
    { titulo: "TB-500 (Timosina Beta-4): Recuperação Tecidual", nivel: "Avançado", tempo: 7, resumo: "Como a Timosina Beta-4 promove angiogênese, migração celular e reparo tecidual. Protocolos de dosagem, sinergias com BPC-157 e evidência científica." },
    { titulo: "CJC-1295 com e sem DAC: Guia Completo", nivel: "Avançado", tempo: 9, resumo: "Diferenças entre CJC-1295 com DAC (Drug Affinity Complex) e sem DAC. Meia-vida, pulsos de GH, dosagem, timing e combinações com GHRP." },
    { titulo: "Ipamorelin: Liberação Seletiva de GH", nivel: "Intermediário", tempo: 6, resumo: "Como o Ipamorelin estimula GH sem aumentar cortisol ou prolactina. Dosagem, combinação com CJC-1295 e protocolos de uso." },
    { titulo: "GHRP-2 e GHRP-6: Secretagogos de GH", nivel: "Avançado", tempo: 7, resumo: "Comparação entre GHRP-2 e GHRP-6, efeitos sobre apetite, liberação de GH e efeitos colaterais. Protocolos e stacks com GHRH." },
    { titulo: "GLP-1 Agonistas: Semaglutida e Tirzepatida", nivel: "Avançado", tempo: 10, resumo: "Protocolos nutricionais completos para usuários de GLP-1 agonistas. Prevenção de sarcopenia, suporte proteico e manejo de efeitos colaterais." },
    { titulo: "MK-677 (Ibutamoren): GH Oral", nivel: "Intermediário", tempo: 6, resumo: "Mecanismo secretagogo oral de GH, impacto em sono, composição corporal e insulina. Riscos, dosagem e duração de ciclos." },
    { titulo: "Colágeno Hidrolisado e Peptídeos Bioativos", nivel: "Iniciante", tempo: 5, resumo: "Tipos de colágeno (I, II, III), dosagem com vitamina C, timing para tendões e articulações. Evidência clínica para saúde articular." },
    { titulo: "AOD-9604: Fragmento de GH para Lipólise", nivel: "Avançado", tempo: 6, resumo: "Como o fragmento 176-191 do GH estimula lipólise sem efeitos hiperglicêmicos. Dosagem, via subcutânea e evidência clínica." },
    { titulo: "Epitalon e Telômeros: Peptídeo da Longevidade", nivel: "Avançado", tempo: 7, resumo: "Evidência sobre ativação de telomerase, protocolos de ciclo, dosagem e potencial anti-envelhecimento do Epitalon." },
  ],
  anabolizantes: [
    { titulo: "Testosterona: Base de Todo Ciclo", nivel: "Avançado", tempo: 10, resumo: "Ésteres de testosterona (enantato, cipionato, propionato, undecanoato), meia-vida, dosagem, frequência de aplicação e monitoramento laboratorial essencial." },
    { titulo: "Oxandrolona (Anavar): Perfil Completo", nivel: "Intermediário", tempo: 7, resumo: "Perfil anabólico/androgênico, impacto hepático, dosagem para homens e mulheres, efeito em lipídios e combinações comuns." },
    { titulo: "Nandrolona (Deca / NPP): Guia Científico", nivel: "Avançado", tempo: 8, resumo: "Diferenças entre Decanoato e Fenilpropionato, impacto em articulações, efeitos colaterais progestagênicos, disfunção erétil (Deca Dick) e manejo." },
    { titulo: "Boldenona (Equipoise): Análise de Evidência", nivel: "Avançado", tempo: 7, resumo: "Mecanismo de ação, impacto no hematócrito, tempo de detecção, metabólitos e relação risco-benefício baseada em literatura." },
    { titulo: "Trembolona: Potência e Riscos", nivel: "Avançado", tempo: 9, resumo: "O anabolizante mais potente: acetato vs enantato, impacto cardíaco, renal, insônia, sudorese noturna. Evidências de toxicidade e protocolos de mitigação." },
    { titulo: "Stanozolol (Winstrol): Oral vs Injetável", nivel: "Intermediário", tempo: 6, resumo: "Hepatotoxicidade, impacto em colesterol e articulações, dosagem e por que atletas ainda utilizam. Formas e comparações." },
    { titulo: "Primobolan (Metenolona): O Suave Poderoso", nivel: "Avançado", tempo: 7, resumo: "Perfil de segurança, uso em cutting, dosagem eficaz, forma oral vs injetável e por que é considerado um dos mais seguros." },
    { titulo: "TPC (Terapia Pós-Ciclo): Guia Definitivo", nivel: "Avançado", tempo: 10, resumo: "Protocolos de TPC com Tamoxifeno, Clomifeno e HCG. Timing, dosagem, restauração do eixo HPT e erros comuns." },
    { titulo: "SARMs: Evidência Atual e Riscos Reais", nivel: "Intermediário", tempo: 8, resumo: "Ostarine, Ligandrol, RAD-140 e outros. O que a ciência realmente diz, supressão hormonal, hepatotoxicidade e legalidade." },
    { titulo: "Suporte Nutricional em Ciclo: Proteção Hepática, Cardíaca e Renal", nivel: "Avançado", tempo: 9, resumo: "Stack de suporte com TUDCA, NAC, Coenzima Q10, ômega-3, citrus bergamot e monitoramento de marcadores. Nutrição otimizada durante uso de AAS." },
    { titulo: "Insulina e GH: Protocolos Avançados", nivel: "Avançado", tempo: 10, resumo: "Uso combinado de insulina e hormônio do crescimento para hipertrofia extrema. Riscos de hipoglicemia, timing nutricional e monitoramento obrigatório." },
    { titulo: "Exames Laboratoriais para Usuários de AAS", nivel: "Intermediário", tempo: 7, resumo: "Painel completo: hemograma, lipídios, hepático, renal, hormônios e marcadores cardíacos. Frequência e interpretação dos resultados." },
  ],
};

interface ProtocolLibraryProps {
  onAskApex: (question: string) => void;
}

const ProtocolLibrary = ({ onAskApex }: ProtocolLibraryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const nivelColor = (n: string) => {
    if (n === "Iniciante") return "text-accent";
    if (n === "Intermediário") return "text-primary";
    return "text-destructive";
  };

  return (
    <div className="space-y-4 pb-16">
      {!selectedCategory ? (
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const count = SAMPLE_PROTOCOLS[cat.key]?.length || 0;
            return (
              <motion.button key={cat.key} whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCategory(cat.key)}
                className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 text-left transition-all space-y-2">
                <span className="text-2xl">{cat.emoji}</span>
                <p className="text-sm font-semibold text-foreground leading-tight">{cat.label}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{count} protocolos</p>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <button onClick={() => setSelectedCategory(null)}
            className="text-xs text-primary font-mono hover:underline">
            ← Voltar às categorias
          </button>
          <h3 className="text-lg font-bold text-foreground">
            {CATEGORIES.find(c => c.key === selectedCategory)?.emoji}{" "}
            {CATEGORIES.find(c => c.key === selectedCategory)?.label}
          </h3>
          {(SAMPLE_PROTOCOLS[selectedCategory] || []).map((proto, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-bold text-foreground flex-1">{proto.titulo}</h4>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className={nivelColor(proto.nivel)}>{proto.nivel}</span>
                <span className="text-muted-foreground">📖 {proto.tempo} min</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{proto.resumo}</p>
              <button onClick={() => onAskApex(`Analise o protocolo "${proto.titulo}" para o meu perfil e sugira adaptações personalizadas.`)}
                className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline mt-1">
                <BookOpen className="w-3 h-3" /> Aplicar ao meu plano →
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProtocolLibrary;
