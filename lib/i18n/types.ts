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
  }
  home: {
    title: string
    subtitle: string
    extractLink: string
    plotLink: string
    benchmarkLink: string
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
}
