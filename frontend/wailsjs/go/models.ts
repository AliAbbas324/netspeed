export namespace config {
	
	export class Config {
	    selectedInterface: string;
	    pollIntervalMs: number;
	    showDownload: boolean;
	    showUpload: boolean;
	    showWidget: boolean;
	    widgetFontSize: number;
	    widgetBgOpacity: number;
	    widgetOpacity: number;
	    widgetTextOpacity: number;
	    widgetX: number;
	    widgetY: number;
	    theme: string;
	    appPreset: string;
	    widgetPreset: string;
	    hideWidgetOnFocus: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.selectedInterface = source["selectedInterface"];
	        this.pollIntervalMs = source["pollIntervalMs"];
	        this.showDownload = source["showDownload"];
	        this.showUpload = source["showUpload"];
	        this.showWidget = source["showWidget"];
	        this.widgetFontSize = source["widgetFontSize"];
	        this.widgetBgOpacity = source["widgetBgOpacity"];
	        this.widgetOpacity = source["widgetOpacity"];
	        this.widgetTextOpacity = source["widgetTextOpacity"];
	        this.widgetX = source["widgetX"];
	        this.widgetY = source["widgetY"];
	        this.theme = source["theme"];
	        this.appPreset = source["appPreset"];
	        this.widgetPreset = source["widgetPreset"];
	        this.hideWidgetOnFocus = source["hideWidgetOnFocus"];
	    }
	}

}

export namespace main {
	
	export class AppState {
	    speeds: Record<string, netmon.InterfaceSpeed>;
	    interfaces: string[];
	    errorMessage: string;
	    sampledAt: string;
	    interfaceCount: number;
	    downloadBytesPerSecond: number;
	    uploadBytesPerSecond: number;
	
	    static createFrom(source: any = {}) {
	        return new AppState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.speeds = this.convertValues(source["speeds"], netmon.InterfaceSpeed, true);
	        this.interfaces = source["interfaces"];
	        this.errorMessage = source["errorMessage"];
	        this.sampledAt = source["sampledAt"];
	        this.interfaceCount = source["interfaceCount"];
	        this.downloadBytesPerSecond = source["downloadBytesPerSecond"];
	        this.uploadBytesPerSecond = source["uploadBytesPerSecond"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace netmon {
	
	export class InterfaceSpeed {
	    downloadBps: number;
	    uploadBps: number;
	
	    static createFrom(source: any = {}) {
	        return new InterfaceSpeed(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.downloadBps = source["downloadBps"];
	        this.uploadBps = source["uploadBps"];
	    }
	}

}

