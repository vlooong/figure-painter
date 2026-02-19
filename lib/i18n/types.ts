export type Locale = 'en' | 'zh'

export interface Translations {
  common: {
    loading: string
    save: string
    cancel: string
    confirm: string
    clear: string
    reset: string
    delete: string
  }
  nav: {
    brand: string
    home: string
    extract: string
    plot: string
    benchmark: string
    gallery: string
  }
  home: {
    title: string
    subtitle: string
    extractLink: string
    plotLink: string
    benchmarkLink: string
    galleryLink: string
  }
  extract: {
    tools: {
      title: string
      select: string
      calibrate: string
      colorPick: string
      draw: string
    }
    exportImport: {
      title: string
      exportCSV: string
      exportExcel: string
      importCSV: string
      undo: string
    }
    saveDataset: string
    sendToPlot: string
    calibration: {
      title: string
      calibrated: string
      startCalibration: string
      instruction: string
      xAxis: string
      yAxis: string
      linear: string
      log: string
      remove: string
      dataX: string
      dataY: string
      confirmCalibration: string
      clearCalibration: string
      pointsSummary: string
    }
    colorPicker: {
      title: string
      selectToolInstruction: string
      clickInstruction: string
      selectedColor: string
      tolerance: string
      toleranceHelp: string
      sampleStep: string
      sampleStepHelp: string
    }
    curveExtractor: {
      title: string
      selectColorAndCalibrate: string
      selectColorFirst: string
      calibrateFirst: string
      tolerance: string
      extracting: string
      extractCurve: string
      extractedPoints: string
      clearExtraction: string
      modeAuto: string
      modeManual: string
      drawInstruction: string
      drawnNodes: string
      commitDraw: string
      clearDraw: string
      undoLastNode: string
    }
    overlay: {
      hideOverlay: string
      showOverlay: string
      opacity: string
    }
    imageCanvas: {
      uploadImage: string
      dropHere: string
      supportedFormats: string
      zoom: string
      clear: string
      pointLabel: string
      pixelCoord: string
    }
    dataTable: {
      title: string
      addPoint: string
      columnX: string
      columnY: string
      noData: string
      deletePoint: string
    }
  }
  plot: {
    noActivePlot: string
    noActiveConfig: string
    datasets: {
      title: string
      empty: string
      points: string
      importCSV: string
      selected: string
      copy: string
    }
    chartSettings: {
      title: string
      chartTitle: string
      chartTitlePlaceholder: string
      xAxis: string
      yAxis: string
      y2Axis: string
      label: string
      unit: string
      min: string
      max: string
      auto: string
      dualYAxis: string
      placeholderTime: string
      placeholderS: string
      placeholderVoltage: string
      placeholderV: string
      placeholderCurrent: string
      placeholderA: string
    }
    styleTemplates: {
      title: string
      customOverrides: string
      titleFontSize: string
      lineWidth: string
      primaryColor: string
      showGrid: string
      resetToTemplate: string
    }
    exportChart: {
      title: string
      filename: string
      filenamePlaceholder: string
      dpi: string
      dpiOption: string
      templateSize: string
      outputSize: string
      exportPNG: string
      exportSVG: string
    }
    advancedConfig: {
      title: string
      dataPoints: string
      showSymbol: string
      symbolSize: string
      symbolShape: string
      shapeCircle: string
      shapeRect: string
      shapeTriangle: string
      shapeDiamond: string
      shapeNone: string
      legend: string
      legendVisible: string
      legendPosition: string
      posTop: string
      posBottom: string
      posLeft: string
      posRight: string
      legendOrientation: string
      orientHorizontal: string
      orientVertical: string
      gridLines: string
      showGridLines: string
      gridLineStyle: string
      styleSolid: string
      styleDashed: string
      styleDotted: string
      lineStyle: string
      lineWidth: string
      lineType: string
      smooth: string
      axisLabels: string
      axisFontSize: string
      showDragHandles: string
    }
  }
  templates: {
    default: { name: string; description: string }
    nature: { name: string; description: string }
    ieee: { name: string; description: string }
    acs: { name: string; description: string }
    science: { name: string; description: string }
    vibrant: { name: string; description: string }
    muted: { name: string; description: string }
    highContrast: { name: string; description: string }
  }
  benchmark: {
    title: string
    subtitle: string
    search: string
    allTasks: string
    domain: string
    features: string
    frequency: string
    algorithm: string
    paper: string
    year: string
    backToList: string
    noResults: string
    copyAs: string
    copyLaTeX: string
    copyTSV: string
    copyMarkdown: string
    copied: string
    best: string
    datasets: string
    settingLabel: string
    source: string
  }
  gallery: {
    title: string
    subtitle: string
    search: string
    filters: {
      chartType: string
      journalStyle: string
      colorTone: string
      reset: string
    }
    chartTypes: {
      line: string
      bar: string
      scatter: string
      heatmap: string
      box: string
      violin: string
      area: string
      radar: string
      pie: string
      sankey: string
      other: string
    }
    colorTones: {
      warm: string
      cool: string
      neutral: string
      vibrant: string
      muted: string
      monochrome: string
    }
    noResults: string
    items: string
    source: string
    favorite: string
    unfavorite: string
    colorPalette: string
    tags: string
    generateWithStyle: string
    generateComingSoon: string
    detail: {
      title: string
      description: string
      source: string
      chartType: string
      journalStyle: string
      colorTone: string
      colorPalette: string
    }
    aiConfig: {
      title: string
      description: string
      apiKey: string
      baseUrl: string
      modelName: string
      save: string
      clear: string
      saved: string
      notConfigured: string
      securityNote: string
    }
  }
}
