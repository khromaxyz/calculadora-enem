export interface ScoreInfo {
    minScore: number;
    avgScore: number;
    maxScore: number;
    aboveAvgPct: string;
  }
  
  export interface Subject {
    subject: string;
    scores: {
      [acertos: string]: ScoreInfo;
    };
  }
  
  export const bancoDeDados: Subject[] = [
    {
      "subject": "matematica",
      "scores": {
        "30": { "minScore": 754.6, "avgScore": 764.7, "maxScore": 774.9, "aboveAvgPct": "69%" },
        "31": { "minScore": 765.4, "avgScore": 775.2, "maxScore": 785.0, "aboveAvgPct": "69%" },
        "32": { "minScore": 775.8, "avgScore": 785.6, "maxScore": 795.3, "aboveAvgPct": "69%" },
        "33": { "minScore": 787.2, "avgScore": 796.8, "maxScore": 806.4, "aboveAvgPct": "69%" },
        "34": { "minScore": 798.5, "avgScore": 808.0, "maxScore": 817.6, "aboveAvgPct": "68%" },
        "35": { "minScore": 810.0, "avgScore": 819.7, "maxScore": 829.5, "aboveAvgPct": "68%" },
        "36": { "minScore": 821.9, "avgScore": 831.7, "maxScore": 841.5, "aboveAvgPct": "69%" },
        "37": { "minScore": 834.8, "avgScore": 845.0, "maxScore": 855.2, "aboveAvgPct": "68%" },
        "38": { "minScore": 848.2, "avgScore": 858.8, "maxScore": 869.5, "aboveAvgPct": "69%" },
        "39": { "minScore": 862.3, "avgScore": 873.7, "maxScore": 885.1, "aboveAvgPct": "69%" },
        "40": { "minScore": 877.9, "avgScore": 890.2, "maxScore": 902.5, "aboveAvgPct": "67%" }
      }
    },
    {
      "subject": "naturezas",
      "scores": {
        "30": { "minScore": 684.9, "avgScore": 693.2, "maxScore": 701.6, "aboveAvgPct": "67%" },
        "31": { "minScore": 692.2, "avgScore": 700.3, "maxScore": 708.5, "aboveAvgPct": "68%" },
        "32": { "minScore": 699.5, "avgScore": 707.6, "maxScore": 715.6, "aboveAvgPct": "67%" },
        "33": { "minScore": 707.3, "avgScore": 715.3, "maxScore": 723.2, "aboveAvgPct": "68%" },
        "34": { "minScore": 714.8, "avgScore": 722.9, "maxScore": 731.1, "aboveAvgPct": "68%" },
        "35": { "minScore": 722.9, "avgScore": 731.1, "maxScore": 739.3, "aboveAvgPct": "69%" },
        "36": { "minScore": 730.8, "avgScore": 739.3, "maxScore": 747.8, "aboveAvgPct": "69%" },
        "37": { "minScore": 739.1, "avgScore": 748.0, "maxScore": 756.9, "aboveAvgPct": "70%" },
        "38": { "minScore": 747.8, "avgScore": 757.4, "maxScore": 766.9, "aboveAvgPct": "67%" },
        "39": { "minScore": 757.2, "avgScore": 767.3, "maxScore": 777.3, "aboveAvgPct": "66%" },
        "40": { "minScore": 766.7, "avgScore": 778.0, "maxScore": 789.3, "aboveAvgPct": "62%" }
      }
    },
    {
      "subject": "humanas",
      "scores": {
        "30": { "minScore": 588.7, "avgScore": 599.5, "maxScore": 610.2, "aboveAvgPct": "68%" },
        "31": { "minScore": 596.4, "avgScore": 607.4, "maxScore": 618.3, "aboveAvgPct": "68%" },
        "32": { "minScore": 604.0, "avgScore": 615.3, "maxScore": 626.6, "aboveAvgPct": "68%" },
        "33": { "minScore": 612.3, "avgScore": 624.0, "maxScore": 635.7, "aboveAvgPct": "68%" },
        "34": { "minScore": 620.7, "avgScore": 632.9, "maxScore": 645.1, "aboveAvgPct": "68%" },
        "35": { "minScore": 629.7, "avgScore": 642.4, "maxScore": 655.1, "aboveAvgPct": "68%" },
        "36": { "minScore": 639.6, "avgScore": 652.8, "maxScore": 666.0, "aboveAvgPct": "67%" },
        "37": { "minScore": 650.0, "avgScore": 663.9, "maxScore": 677.8, "aboveAvgPct": "67%" },
        "38": { "minScore": 661.4, "avgScore": 676.0, "maxScore": 690.6, "aboveAvgPct": "66%" },
        "39": { "minScore": 673.9, "avgScore": 689.2, "maxScore": 704.5, "aboveAvgPct": "65%" },
        "40": { "minScore": 688.4, "avgScore": 704.1, "maxScore": 719.9, "aboveAvgPct": "66%" }
      }
    },
    {
      "subject": "linguagens",
      "scores": {
        "30": { "minScore": 585.5, "avgScore": 595.3, "maxScore": 605.2, "aboveAvgPct": "68%" },
        "31": { "minScore": 594.0, "avgScore": 603.8, "maxScore": 613.7, "aboveAvgPct": "68%" },
        "32": { "minScore": 603.0, "avgScore": 612.7, "maxScore": 622.5, "aboveAvgPct": "68%" },
        "33": { "minScore": 612.2, "avgScore": 622.0, "maxScore": 631.8, "aboveAvgPct": "68%" },
        "34": { "minScore": 621.8, "avgScore": 631.6, "maxScore": 641.5, "aboveAvgPct": "68%" },
        "35": { "minScore": 632.1, "avgScore": 642.3, "maxScore": 651.7, "aboveAvgPct": "68%" },
        "36": { "minScore": 643.1, "avgScore": 652.8, "maxScore": 662.5, "aboveAvgPct": "68%" },
        "37": { "minScore": 654.8, "avgScore": 664.3, "maxScore": 673.9, "aboveAvgPct": "68%" },
        "38": { "minScore": 667.6, "avgScore": 676.8, "maxScore": 686.1, "aboveAvgPct": "69%" },
        "39": { "minScore": 681.1, "avgScore": 690.2, "maxScore": 699.3, "aboveAvgPct": "70%" },
        "40": { "minScore": 695.8, "avgScore": 704.9, "maxScore": 713.7, "aboveAvgPct": "72%" }
      }
    }
  ];