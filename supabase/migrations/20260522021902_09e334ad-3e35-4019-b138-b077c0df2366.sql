CREATE TABLE IF NOT EXISTS public.apex_training_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achado_key      TEXT NOT NULL,
  achado_label    TEXT NOT NULL,
  severidade_min  INTEGER DEFAULT 0,
  corretivos      JSONB NOT NULL DEFAULT '[]',
  contraindicados JSONB NOT NULL DEFAULT '[]',
  ativacao_alvo   TEXT[] DEFAULT '{}',
  ativo           BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apex_rules_achado
  ON public.apex_training_rules(achado_key);

ALTER TABLE public.apex_training_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches leem regras"
  ON public.apex_training_rules FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO public.apex_training_rules
  (achado_key, achado_label, severidade_min, corretivos, contraindicados, ativacao_alvo)
VALUES
('scapula_alada','Escápula alada',1,
 '[{"nome":"Serrátil press na parede","series":3,"reps":"15","tempo":"3s excêntrico","foco":"ativação serrátil anterior"},{"nome":"Wall slide com resistência","series":3,"reps":"12","tempo":"controlado","foco":"estabilização escapular"},{"nome":"Protração com faixa elástica","series":2,"reps":"15","tempo":"2-0-2","foco":"serrátil + trapézio inferior"}]'::jsonb,
 '[{"padrao":"supino reto","motivo":"sobrecarrega peitoral menor inibindo serrátil"},{"padrao":"crucifixo","motivo":"protrai ombro agravando escápula alada"},{"padrao":"peck deck","motivo":"encurta peitoral menor dominante"}]'::jsonb,
 ARRAY['serrátil anterior','trapézio inferior','rombóides']),
('shoulder_protraction','Ombro protraído',1,
 '[{"nome":"Retração escapular com faixa","series":3,"reps":"15","tempo":"2s isométrico no pico","foco":"rombóides + trapézio médio"},{"nome":"Face pull","series":3,"reps":"15","tempo":"controlado","foco":"infraespinal + redondo menor"},{"nome":"Alongamento peitoral menor no banco","series":2,"reps":"30s","tempo":"estático","foco":"alongar peitoral menor dominante"}]'::jsonb,
 '[{"padrao":"desenvolvimento anterior","motivo":"deltóide anterior já dominante — agrava protração"},{"padrao":"supino inclinado","motivo":"aumenta dominância peitoral anterior"}]'::jsonb,
 ARRAY['rombóides','trapézio médio','infraespinal','redondo menor']),
('shoulder_asymmetry','Assimetria de ombros',2,
 '[{"nome":"Elevação lateral unilateral lado inibido","series":3,"reps":"12","tempo":"isolado","foco":"ativar deltóide lado fraco"},{"nome":"Shrug unilateral lado inibido","series":2,"reps":"15","tempo":"2s contração","foco":"equalizar trapézio superior"},{"nome":"Alongamento trapézio superior lado dominante","series":2,"reps":"40s","tempo":"estático","foco":"inibir lado hipertônico"}]'::jsonb,
 '[{"padrao":"barra no supino","motivo":"carga bilateral compensa assimetria sem corrigi-la"}]'::jsonb,
 ARRAY['deltóide lateral','trapézio superior contralateral']),
('pelvic_tilt','Assimetria de quadril',1,
 '[{"nome":"Clamshell unilateral lado inibido","series":3,"reps":"15","tempo":"2s isométrico","foco":"ativar glúteo médio"},{"nome":"Abdução com faixa em pé lado fraco","series":3,"reps":"12","tempo":"controlado","foco":"glúteo médio isolado"},{"nome":"Alongamento QL bilateral","series":2,"reps":"40s cada","tempo":"estático","foco":"liberar quadrado lombar dominante"},{"nome":"Bird dog","series":3,"reps":"10 cada lado","tempo":"5s isométrico","foco":"estabilização pélvica"}]'::jsonb,
 '[{"padrao":"agachamento livre","motivo":"desequilíbrio pélvico cria padrão compensatório com carga"},{"padrao":"leg press unilateral","motivo":"pode agravar rotação pélvica"}]'::jsonb,
 ARRAY['glúteo médio','quadrado lombar contralateral','TFL']),
('lateral_spine_deviation','Desvio lateral da coluna',2,
 '[{"nome":"Prancha lateral bilateral","series":3,"reps":"30s cada","tempo":"estático","foco":"oblíquos + quadrado lombar"},{"nome":"Pallof press anti-rotação","series":3,"reps":"12 cada","tempo":"2s isométrico","foco":"core anti-lateral"},{"nome":"Deadbug","series":3,"reps":"8 cada lado","tempo":"5s isométrico","foco":"estabilização lombar profunda"}]'::jsonb,
 '[{"padrao":"levantamento terra","motivo":"desvio lateral com carga axial — risco de lesão lombar"},{"padrao":"barra no good morning","motivo":"carga axial com desvio lateral contraindicado"}]'::jsonb,
 ARRAY['oblíquo externo','oblíquo interno','quadrado lombar','multífido']),
('hyperlordosis','Hiperlordose lombar',1,
 '[{"nome":"Ativação glúteo em decúbito","series":3,"reps":"20","tempo":"2s contração","foco":"glúteo máximo inibido"},{"nome":"Abdominal hollowing","series":3,"reps":"10","tempo":"10s isométrico","foco":"transverso abdominal"},{"nome":"Alongamento flexor de quadril","series":2,"reps":"40s cada","tempo":"estático","foco":"psoas + reto femoral encurtados"},{"nome":"Dead bug","series":3,"reps":"8 cada","tempo":"5s","foco":"core profundo anti-extensão"}]'::jsonb,
 '[{"padrao":"extensão lombar","motivo":"agrava hiperlordose e compressão facetária"},{"padrao":"good morning","motivo":"momento flexor com coluna já em lordose excessiva"},{"padrao":"agachamento com barra alta","motivo":"avaliar ROM antes — risco de retroversão compensatória"}]'::jsonb,
 ARRAY['glúteo máximo','transverso abdominal','multífido'])
ON CONFLICT DO NOTHING;