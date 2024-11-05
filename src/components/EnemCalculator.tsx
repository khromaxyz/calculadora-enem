'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import {
  BookOpen,
  Brain,
  Calculator,
  FileSpreadsheet,
  PenTool,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { bancoDeDados, type ScoreInfo } from '@/data/bancoDeDados';


interface Combinacao {
  id: string;
  acertosLC: number;
  acertosCH: number;
  acertosCN: number;
  acertosMT: number;
  notaLC: number;
  notaCH: number;
  notaCN: number;
  notaMT: number;
  notaRed: number;
  media: number;
  label: string;
  detalhes: {
    LC: ScoreInfo;
    CH: ScoreInfo;
    CN: ScoreInfo;
    MT: ScoreInfo;
  };
}

const EnemCalculator: React.FC = () => {
  // Estados
  const [meanMedia, setMeanMedia] = useState<number>(0);
  const [stdDevMedia, setStdDevMedia] = useState<number>(0);
  const [totalAcertos, setTotalAcertos] = useState<string>('');
  const [notaCorte, setNotaCorte] = useState<string>('');
  const [notaRedacao, setNotaRedacao] = useState<string>('');
  const [pesoLC, setPesoLC] = useState<string>('');
  const [pesoCH, setPesoCH] = useState<string>('');
  const [pesoCN, setPesoCN] = useState<string>('');
  const [pesoMT, setPesoMT] = useState<string>('');
  const [pesoRed, setPesoRed] = useState<string>('');
  const [fixedAcertosLC, setFixedAcertosLC] = useState<string>('');
  const [fixedAcertosCH, setFixedAcertosCH] = useState<string>('');
  const [fixedAcertosMT, setFixedAcertosMT] = useState<string>('');
  const [fixedAcertosCN, setFixedAcertosCN] = useState<string>('');
  const [combinacoes, setCombinacoes] = useState<Combinacao[]>([]);
  const [error, setError] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Funções auxiliares
  const getAvgScore = (materia: string, acertos: number): number => {
    const subject = bancoDeDados.find(subj => subj.subject === materia.toLowerCase());
    if (!subject) return 0;
    const scoreInfo = subject.scores[acertos.toString()];
    return scoreInfo ? scoreInfo.avgScore : 0;
  };

  const getScoreDetails = (materia: string, acertos: number): ScoreInfo | null => {
    const subject = bancoDeDados.find(subj => subj.subject === materia.toLowerCase());
    if (!subject) return null;
    const scoreInfo = subject.scores[acertos.toString()];
    return scoreInfo || null;
  };

  const calcularMediaPonderada = (
    notaLC: number,
    notaCH: number,
    notaCN: number,
    notaMT: number,
    notaRed: number
  ): number => {
    const pLC = Number(pesoLC);
    const pCH = Number(pesoCH);
    const pCN = Number(pesoCN);
    const pMT = Number(pesoMT);
    const pRed = Number(pesoRed);
    const totalPeso = pLC + pCH + pCN + pMT + pRed;

    return (pLC * notaLC + pCH * notaCH + pCN * notaCN + pMT * notaMT + pRed * notaRed) / totalPeso;
  };

  // Função de validação
  const validarEntradas = (): boolean => {
    const total = Number(totalAcertos);
    const notaR = Number(notaRedacao);
    const corte = Number(notaCorte);
    const pLC = Number(pesoLC);
    const pCH = Number(pesoCH);
    const pCN = Number(pesoCN);
    const pMT = Number(pesoMT);
    const pRed = Number(pesoRed);

    if (
      totalAcertos === '' ||
      notaCorte === '' ||
      notaRedacao === '' ||
      pesoLC === '' ||
      pesoCH === '' ||
      pesoCN === '' ||
      pesoMT === '' ||
      pesoRed === ''
    ) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    if (total < 120 || total > 160) {
      setError('O total de acertos deve estar entre 120 e 160');
      return false;
    }

    if (notaR < 0 || notaR > 1000 || notaR % 20 !== 0) {
      setError('A nota da redação deve ser um múltiplo de 20 entre 0 e 1000');
      return false;
    }

    if (corte < 400 || corte > 1000) {
      setError('A nota de corte deve estar entre 400 e 1000');
      return false;
    }

    if (
      pLC < 1 ||
      pLC > 5 ||
      pCH < 1 ||
      pCH > 5 ||
      pCN < 1 ||
      pCN > 5 ||
      pMT < 1 ||
      pMT > 5 ||
      pRed < 1 ||
      pRed > 5
    ) {
      setError('Os pesos devem estar entre 1 e 5');
      return false;
    }

    // Validação para acertos fixos (opcional)
    if (fixedAcertosLC !== '') {
      const acertos = Number(fixedAcertosLC);
      if (acertos < 30 || acertos > 40) {
        setError('Os acertos fixos em Linguagens devem estar entre 30 e 40');
        return false;
      }
    }

    if (fixedAcertosCH !== '') {
      const acertos = Number(fixedAcertosCH);
      if (acertos < 30 || acertos > 40) {
        setError('Os acertos fixos em Humanas devem estar entre 30 e 40');
        return false;
      }
    }

    if (fixedAcertosMT !== '') {
      const acertos = Number(fixedAcertosMT);
      if (acertos < 30 || acertos > 40) {
        setError('Os acertos fixos em Matemática devem estar entre 30 e 40');
        return false;
      }
    }

    if (fixedAcertosCN !== '') {
      const acertos = Number(fixedAcertosCN);
      if (acertos < 30 || acertos > 40) {
        setError('Os acertos fixos em Naturezas devem estar entre 30 e 40');
        return false;
      }
    }

    return true;
  };

  // Funções auxiliares para o cálculo de probabilidade
  function cdf(x: number): number {
    return (1 + erf(x / Math.sqrt(2))) / 2;
  }

  function erf(x: number): number {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  // Função de geração de combinações
  const gerarCombinacoes = useCallback(() => {
    if (!validarEntradas()) {
      setIsCalculating(false);
      return;
    }

    const novasCombinacoes: Combinacao[] = [];
    const total = Number(totalAcertos);
    const notaRed = Number(notaRedacao);

    // Determinar se acertos estão fixos
    const fixedLC = fixedAcertosLC !== '' ? Number(fixedAcertosLC) : null;
    const fixedCH = fixedAcertosCH !== '' ? Number(fixedAcertosCH) : null;
    const fixedMT = fixedAcertosMT !== '' ? Number(fixedAcertosMT) : null;
    const fixedCN = fixedAcertosCN !== '' ? Number(fixedAcertosCN) : null;

    // Definir os intervalos para cada matéria
    const startLC = fixedLC !== null ? fixedLC : 30;
    const endLC = fixedLC !== null ? fixedLC : 40;

    const startCH = fixedCH !== null ? fixedCH : 30;
    const endCH = fixedCH !== null ? fixedCH : 40;

    const startMT = fixedMT !== null ? fixedMT : 30;
    const endMT = fixedMT !== null ? fixedMT : 40;

    const startCN = fixedCN !== null ? fixedCN : 30;
    const endCN = fixedCN !== null ? fixedCN : 40;

    // Loop para cada possível combinação de acertos
    for (let acertosLC = startLC; acertosLC <= endLC && acertosLC <= total - 90; acertosLC++) {
      for (let acertosCH = startCH; acertosCH <= endCH && (acertosLC + acertosCH) <= total - 60; acertosCH++) {
        for (let acertosCN = startCN; acertosCN <= endCN && (acertosLC + acertosCH + acertosCN) <= total - 30; acertosCN++) {
          const acertosMT = total - (acertosLC + acertosCH + acertosCN);

          // Verifica se a combinação é válida dentro do intervalo
          if (acertosMT >= 30 && acertosMT <= 40) {
            const notaLC = getAvgScore("linguagens", acertosLC);
            const notaCH = getAvgScore("humanas", acertosCH);
            const notaCN = getAvgScore("naturezas", acertosCN);
            const notaMT = getAvgScore("matematica", acertosMT);
            const media = calcularMediaPonderada(notaLC, notaCH, notaCN, notaMT, notaRed);

            // Obter detalhes dos scores
            const detalhes = {
              LC: getScoreDetails("linguagens", acertosLC)!,
              CH: getScoreDetails("humanas", acertosCH)!,
              CN: getScoreDetails("naturezas", acertosCN)!,
              MT: getScoreDetails("matematica", acertosMT)!,
            };

            novasCombinacoes.push({
              id: `${acertosLC}-${acertosCH}-${acertosCN}-${acertosMT}-${notaRed}`,
              acertosLC,
              acertosCH,
              acertosCN,
              acertosMT,
              notaLC,
              notaCH,
              notaCN,
              notaMT,
              notaRed,
              media,
              label: `LC:${acertosLC} CH:${acertosCH} CN:${acertosCN} MT:${acertosMT}`,
              detalhes
            });
          }
        }
      }
    }

    // Ordena as combinações pela média
    novasCombinacoes.sort((a, b) => b.media - a.media);

    // Inclui todas as combinações no gráfico
    setCombinacoes(novasCombinacoes);
    setShowResults(true);
    setError('');
    setIsCalculating(false);

    // Calcular meanMedia e stdDevMedia
    if (novasCombinacoes.length > 0) {
      const medias = novasCombinacoes.map(c => c.media);
      const mean = medias.reduce((sum, value) => sum + value, 0) / medias.length;
      const stdDev = Math.sqrt(
        medias.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / medias.length
      );

      setMeanMedia(mean);
      setStdDevMedia(stdDev);
    } else {
      setMeanMedia(0);
      setStdDevMedia(0);
    }
  }, [totalAcertos, pesoLC, pesoCH, pesoCN, pesoMT, pesoRed, notaRedacao, fixedAcertosLC, fixedAcertosCH, fixedAcertosMT, fixedAcertosCN]);

  const handleCalcular = () => {
    setIsCalculating(true);
    setTimeout(() => {
      gerarCombinacoes();
    }, 500);
  };

  // Cálculos memorizados
  const maxMedia = useMemo(() => 
    combinacoes.length > 0 ? Math.max(...combinacoes.map(c => c.media)) : 0, 
    [combinacoes]
  );

  const minMedia = useMemo(() => 
    combinacoes.length > 0 ? Math.min(...combinacoes.map(c => c.media)) : 0, 
    [combinacoes]
  );

  const probabilidadeAprovacao = useMemo(() => {
    if (combinacoes.length === 0 || stdDevMedia === 0) return "0.00";

    const zScore = (Number(notaCorte) - meanMedia) / stdDevMedia;
    const probabilidade = (1 - cdf(zScore)) * 100;

    return probabilidade.toFixed(2);
  }, [meanMedia, stdDevMedia, notaCorte]);

  // Estilo da probabilidade
  const probabilityStyles = useMemo(() => {
    const value = parseFloat(probabilidadeAprovacao);
    if (value >= 70) {
      return 'bg-green-500/30 text-white border border-green-400/30 shadow-lg shadow-green-500/20';
    } else if (value >= 40) {
      return 'bg-yellow-500/30 text-white border border-yellow-400/30 shadow-lg shadow-yellow-500/20';
    } else {
      return 'bg-red-500/30 text-white border border-red-400/30 shadow-lg shadow-red-500/20';
    }
  }, [probabilidadeAprovacao]);

  // CustomTooltip para o gráfico
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]?.payload) return null;

    const data: Combinacao = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transform transition-all duration-200">
        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Combinação</p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              LC: {data.acertosLC} acertos ({data.detalhes.LC.minScore.toFixed(1)} - {data.detalhes.LC.maxScore.toFixed(1)})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              CH: {data.acertosCH} acertos ({data.detalhes.CH.minScore.toFixed(1)} - {data.detalhes.CH.maxScore.toFixed(1)})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-green-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              CN: {data.acertosCN} acertos ({data.detalhes.CN.minScore.toFixed(1)} - {data.detalhes.CN.maxScore.toFixed(1)})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-red-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              MT: {data.acertosMT} acertos ({data.detalhes.MT.minScore.toFixed(1)} - {data.detalhes.MT.maxScore.toFixed(1)})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <PenTool className="w-4 h-4 text-yellow-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Redação: {data.notaRed.toFixed(1)} pontos
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Média Final: {data.media.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.media >= Number(notaCorte)
                ? "✅ Acima da nota de corte"
                : "❌ Abaixo da nota de corte"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 p-8 rounded-t-2xl shadow-lg transform transition-all duration-300 hover:scale-[1.01]">
          <h1 className="text-4xl font-bold text-white flex items-center space-x-3">
            <Calculator className="w-10 h-10" />
            <span>Simulador de Notas ENEM</span>
          </h1>
          <p className="text-blue-100 mt-4 flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Explore suas chances de ingresso com base nos pesos do seu curso</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-lg p-8 transition-all duration-200">
          {/* Seção informativa */}
          <div className="mb-12 bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl shadow-inner">
            <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center space-x-2">
              <Info className="w-6 h-6" />
              <span>Como usar o simulador:</span>
            </h2>
            <ol className="list-none space-y-4">
              <li className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                <Target className="w-5 h-5 flex-shrink-0" />
                <span>Informe a nota de corte do seu curso</span>
              </li>
              <li className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />
                <span>Digite o total de acertos que você pretende obter (entre 120 e 160)</span>
              </li>
              <li className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                <PenTool className="w-5 h-5 flex-shrink-0" />
                <span>Informe sua nota esperada na redação (múltiplo de 20)</span>
              </li>
              <li className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                <Calculator className="w-5 h-5 flex-shrink-0" />
                <span>Adicione os pesos das matérias conforme seu curso</span>
              </li>
              <li className="flex items-center space-x-3 text-blue-700 dark:text-blue-300">
                <BookOpen className="w-5 h-5 flex-shrink-0" />
                <span>Opcional: Informe os acertos que você já sabe que obteve em cada matéria</span>
              </li>
            </ol>
          </div>
          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Primeira coluna: Notas */}
            <div className="space-y-8">
              {/* Nota de Corte */}
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Nota de Corte do Curso *</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Consulte o histórico do curso ou o último SISU
                </p>
                <div className="relative">
                  <input
                    type="number"
                    value={notaCorte}
                    onChange={(e) => setNotaCorte(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-3 
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             transition-all duration-200"
                    placeholder="Exemplo: 750.5"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">pontos</span>
                  </div>
                </div>
              </div>

              {/* Total de Acertos */}
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Meta de Acertos Total *</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Soma dos acertos nas provas objetivas (120-160)
                </p>
                <div className="relative">
                  <input
                    type="number"
                    value={totalAcertos}
                    onChange={(e) => setTotalAcertos(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-3 
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             transition-all duration-200"
                    placeholder="Exemplo: 140"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">acertos</span>
                  </div>
                </div>
              </div>

              {/* Nota Redação */}
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center space-x-2">
                  <PenTool className="w-5 h-5" />
                  <span>Nota Esperada na Redação *</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Múltiplo de 20 entre 0 e 1000
                </p>
                <div className="relative">
                  <input
                    type="number"
                    value={notaRedacao}
                    onChange={(e) => setNotaRedacao(e.target.value)}
                    step="20"
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-3 
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             transition-all duration-200"
                    placeholder="Exemplo: 860"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">pontos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Segunda coluna: Pesos e Acertos Fixos */}
            <div className="space-y-8">
              {/* Pesos das Matérias */}
              <div className="transform transition-all duration-200 hover:scale-[1.01]">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Pesos das Matérias *</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Conforme edital do seu curso (1 a 5)
                </p>

                {/* Grid de Pesos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {/* Peso Linguagens */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Linguagens</span>
                    </label>
                    <input
                      type="number"
                      value={pesoLC}
                      onChange={(e) => setPesoLC(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center
                               transition-all duration-200"
                      placeholder="1-5"
                    />
                  </div>

                  {/* Peso Humanas */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>Humanas</span>
                    </label>
                    <input
                      type="number"
                      value={pesoCH}
                      onChange={(e) => setPesoCH(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center
                               transition-all duration-200"
                      placeholder="1-5"
                    />
                  </div>

                  {/* Peso Naturezas */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Naturezas</span>
                    </label>
                    <input
                      type="number"
                      value={pesoCN}
                      onChange={(e) => setPesoCN(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center
                               transition-all duration-200"
                      placeholder="1-5"
                    />
                  </div>

                  {/* Peso Matemática */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center space-x-2">
                      <Calculator className="w-4 h-4" />
                      <span>Matemática</span>
                    </label>
                    <input
                      type="number"
                      value={pesoMT}
                      onChange={(e) => setPesoMT(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center
                               transition-all duration-200"
                      placeholder="1-5"
                    />
                  </div>

                  {/* Peso Redação */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center space-x-2">
                      <PenTool className="w-4 h-4" />
                      <span>Redação</span>
                    </label>
                    <input
                      type="number"
                      value={pesoRed}
                      onChange={(e) => setPesoRed(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center
                               transition-all duration-200"
                      placeholder="1-5"
                    />
                  </div>
                </div>
              </div>

              {/* Acertos Fixos (Opcional) */}
              <div className="mt-8">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Acertos Fixos (Opcional)</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Informe os acertos que você já sabe que obteve em cada matéria
                </p>
                
                {/* Grid de Acertos Fixos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {/* Acertos Linguagens */}
                  <div className="transform transition-all duration-200 hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Linguagens</span>
                    </label>
                    <input
                      type="number"
                      value={fixedAcertosLC}
                      onChange={(e) => setFixedAcertosLC(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center
                               transition-all duration-200"
                      placeholder="30-40"
                    />
                  </div>

                  {/* Acertos Humanas */}
                  <div className="transform transition-all duration-200 hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 flex items-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>Humanas</span>
                    </label>
                    <input
                      type="number"
                      value={fixedAcertosCH}
                      onChange={(e) => setFixedAcertosCH(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center
                               transition-all duration-200"
                      placeholder="30-40"
                    />
                  </div>

                  {/* Acertos Matemática */}
                  <div className="transform transition-all duration-200 hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 flex items-center space-x-2">
                      <Calculator className="w-4 h-4" />
                      <span>Matemática</span>
                    </label>
                    <input
                      type="number"
                      value={fixedAcertosMT}
                      onChange={(e) => setFixedAcertosMT(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center
                               transition-all duration-200"
                      placeholder="30-40"
                    />
                  </div>

                  {/* Acertos Naturezas */}
                  <div className="transform transition-all duration-200 hover:scale-[1.01]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Naturezas</span>
                    </label>
                    <input
                      type="number"
                      value={fixedAcertosCN}
                      onChange={(e) => setFixedAcertosCN(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center
                               transition-all duration-200"
                      placeholder="30-40"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem de erro com animação */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-lg 
                          flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão de calcular com loading state */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleCalcular}
              disabled={isCalculating}
              className={`
                px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg
                transform transition-all duration-200
                hover:bg-blue-700 dark:hover:bg-blue-600 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center space-x-2
              `}
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Calculando...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>Calcular Possibilidades</span>
                </>
              )}
            </button>
          </div>

          {/* Seção de Resultados */}
          {showResults && !isCalculating && (
            <>
              {/* Exibição da Probabilidade de Aprovação */}
              <div className="mt-12">
                <div className={`
                  relative overflow-hidden rounded-xl
                  backdrop-blur-sm transition-all duration-300
                  ${probabilityStyles}
                `}>
                  {/* Gradiente e círculos decorativos permanecem iguais */}

                  {/* Conteúdo */}
                  <div className="relative p-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-3">
                        <Target className="w-6 h-6" />
                        <span>Probabilidade de Aprovação</span>
                      </h3>

                      {/* Container da porcentagem */}
                      <div className="mb-6">
                        <div className="inline-block relative">
                          <div className="text-7xl font-black tracking-tighter mb-1">
                            {probabilidadeAprovacao}%
                          </div>
                        </div>
                      </div>

                      {/* Estatísticas */}
                      <div className="mb-6 flex justify-center gap-8">
                        <div>
                          <p className="text-sm opacity-80">Média Geral</p>
                          <p className="text-xl font-bold">{meanMedia.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-80">Desvio Padrão</p>
                          <p className="text-xl font-bold">{stdDevMedia.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Informação TRI Simplificada */}
                      <div className="mt-6 text-sm max-w-2xl mx-auto">
                        <div className="p-4 rounded-xl bg-black/10 backdrop-blur-md">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-left">
                              A probabilidade foi calculada utilizando a Teoria de Resposta ao Item (TRI). 
                              Mais informações sobre o cálculo da probabilidade estão disponíveis no final desta página.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de Combinações */}
              <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center space-x-2">
                  <Target className="w-6 h-6" />
                  <span>Distribuição de Notas Possíveis</span>
                </h3>
                
                <div className="h-[32rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={combinacoes}
                      margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#374151"
                        opacity={0.2}
                      />
                      <XAxis
                        dataKey="label"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={Math.floor(combinacoes.length / 10)}
                        tick={{ 
                          fontSize: 10,
                          fill: '#6B7280'
                        }}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        label={{
                          value: 'Nota Final',
                          angle: -90,
                          position: 'insideLeft',
                          style: { 
                            textAnchor: 'middle',
                            fill: '#6B7280'
                          }
                        }}
                        tick={{ 
                          fontSize: 12,
                          fill: '#6B7280'
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine
                        y={Number(notaCorte)}
                        stroke="#F59E0B"
                        strokeDasharray="3 3"
                        label={{
                          value: 'Nota de Corte',
                          position: 'right',
                          fill: '#F59E0B',
                          fontSize: 12
                        }}
                      />
                      <ReferenceLine
                        y={maxMedia}
                        stroke="#10B981"
                        strokeDasharray="3 3"
                        label={{
                          value: `Máximo: ${maxMedia.toFixed(2)}`,
                          position: 'right',
                          fill: '#10B981',
                          fontSize: 12
                        }}
                      />
                      <ReferenceLine
                        y={minMedia}
                        stroke="#EF4444"
                        strokeDasharray="3 3"
                        label={{
                          value: `Mínimo: ${minMedia.toFixed(2)}`,
                          position: 'right',
                          fill: '#EF4444',
                          fontSize: 12
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="media"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                          r: 8,
                          fill: (data: any) => 
                            data.payload.media >= Number(notaCorte) 
                              ? "#10B981" 
                              : "#EF4444"
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabela de Combinações */}
              <div className="mt-12">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                      <FileSpreadsheet className="w-6 h-6" />
                      <span>Combinações Possíveis</span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th scope="col" className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                            Tipo
                          </th>
                          <th scope="col" className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                            Linguagens
                          </th>
                          <th scope="col" className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                            Humanas
                          </th>
                          <th scope="col" className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                            Naturezas
                          </th>
                          <th scope="col" className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                            Matemática
                          </th>
                          <th scope="col" className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                            Redação
                          </th>
                          <th scope="col" className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                            Média
                          </th>
                          <th scope="col" className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {combinacoes.map((combinacao, index) => (
                          <tr 
                            key={combinacao.id}
                            className={`
                              ${combinacao.media >= Number(notaCorte) 
                                ? "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30" 
                                : "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"}
                              transition-colors duration-150
                            `}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                              {index === 0 
                                ? (
                                  <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                                    <Award className="w-4 h-4" />
                                    <span>Melhor</span>
                                  </div>
                                ) 
                                : index === combinacoes.length - 1 
                                  ? (
                                    <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                                      <AlertCircle className="w-4 h-4" />
                                      <span>Pior</span>
                                    </div>
                                  ) 
                                  : ''}
                            </td>
                            {/* Células para cada disciplina */}
                            {[
                              { acertos: combinacao.acertosLC, nota: combinacao.notaLC, detalhes: combinacao.detalhes.LC, icon: BookOpen, color: 'blue' },
                              { acertos: combinacao.acertosCH, nota: combinacao.notaCH, detalhes: combinacao.detalhes.CH, icon: Brain, color: 'purple' },
                              { acertos: combinacao.acertosCN, nota: combinacao.notaCN, detalhes: combinacao.detalhes.CN, icon: FileSpreadsheet, color: 'green' },
                              { acertos: combinacao.acertosMT, nota: combinacao.notaMT, detalhes: combinacao.detalhes.MT, icon: Calculator, color: 'red' }
                            ].map((item, idx) => (
                              <td key={idx} className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <div className="text-sm text-gray-900 dark:text-gray-100 font-medium flex items-center space-x-2">
                                    <item.icon className={`w-4 h-4 text-${item.color}-500`} />
                                    <span>{item.acertos} acertos</span>
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="font-medium">{item.nota.toFixed(1)}</span>
                                    <span> pontos</span>
                                    <div className="text-xs mt-1">
                                      <span className="text-green-600 dark:text-green-400">↑ {item.detalhes.maxScore.toFixed(1)}</span>
                                      <span className="mx-1">|</span>
                                      <span className="text-red-600 dark:text-red-400">↓ {item.detalhes.minScore.toFixed(1)}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-sm text-gray-900 dark:text-gray-100 font-medium flex items-center space-x-2">
                                  <PenTool className="w-4 h-4 text-yellow-500" />
                                  <span>{combinacao.notaRed.toFixed(1)}</span>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  pontos
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-bold">
                                <span className={
                                  combinacao.media >= Number(notaCorte)
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }>
                                  {combinacao.media.toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {combinacao.media >= Number(notaCorte) ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Aprovado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Reprovado
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legenda da tabela */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span>Acima da Nota de Corte</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span>Abaixo da Nota de Corte</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span>Melhor Combinação</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span>Pior Combinação</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
{/* Seção de Explicação Matemática */}
<div className="mt-12">
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
      Detalhes do Cálculo da Probabilidade
    </h3>
    <p className="text-gray-700 dark:text-gray-300 mb-4">
      A probabilidade de aprovação é calculada considerando a Teoria de Resposta ao Item (TRI) e a distribuição das notas. Mais informações sobre o cálculo da probabilidade estão detalhadas abaixo.
    </p>
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md space-y-4">
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-200">Fórmula da Probabilidade:</p>
        <pre className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
{`P = 1 - CDF(z)

Onde:
CDF(z) é a função de distribuição cumulativa para a distribuição normal padrão.`}
        </pre>
      </div>
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-200">Cálculo do z-score:</p>
        <pre className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
{`z = (Nota de Corte - Média das Médias) / Desvio Padrão das Médias`}
        </pre>
      </div>
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-200">Função de Probabilidade Completa:</p>
        <pre className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
{`P = 1 - (1/2) * [1 + erf(z / sqrt(2))]

onde:
erf(x) é a função erro, calculada como:
erf(x) = (2 / sqrt(π)) * ∫ e^(-t^2) dt, de t = 0 até x.`}
        </pre>
      </div>
    </div>
  </div>
</div>

{/* Finalização da Página */}
<div className="mt-12">
  <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
    Cálculo detalhado desenvolvido para fornecer uma análise probabilística baseada em TRI e distribuição normal, aplicada ao contexto das notas do ENEM.
  </p>
</div>

              
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnemCalculator;
