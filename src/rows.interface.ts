export interface Rows {}

export interface RowData{
    row: string[];
}
export interface Headerindex {
    numberIndex: number;
    dateIndex: number;
    geohashIndex: number;
    baseName: number;
}

export interface PhoneGeoHashNew {
    phone: string;
    geoHash: string;
    inDateTime: string;
    geoHashName: string;
}

export interface ExportPhonesResult{
    phone: string;
    geoHash: string;
    beginTime: string;
    endTime: string;
    interval: number;
    geoHashName: string;
}

export interface PhoneGeoHashNameCountNew{
    phone: string;
    geoHash: string;
    baseName: string;
    baseNameCount: number;
}
