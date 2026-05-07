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

