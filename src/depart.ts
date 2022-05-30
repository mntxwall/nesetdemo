import {ExportPhonesResult, Headerindex, PhoneGeoHashNameCountNew, PhoneGeoHashNew, RowData} from "./rows.interface";

export class Depart {

    //三个selectd，用于表示用户选择这三个表头使用的字段
    private selectedNumbers: string = "己方号码";
    private selectedDateTime: string = "截获时间*";
    private selectedGEOHASH: string = "7位GEOHASH";
    private selectedBashName: string = "基站名称";

    private rowsFromFile: RowData[] = [];
    //用于存储导入的文本数据中分析出来的表头
    private headers: string[] = [];

    tableData:string = "";

    private preCalculate: PhoneGeoHashNew = {} as PhoneGeoHashNew;
    private currentCalculate: PhoneGeoHashNew = {} as PhoneGeoHashNew;

    //用来表示在查找时当前要找哪一个元素
    private findValue: PhoneGeoHashNew = {} as PhoneGeoHashNew;

    //用来存储最后的结果
    private resultPhonesGeoHashDataTime:ExportPhonesResult[] = [];
    //用来存储基站名称最后累计出来的值
    private resultPhoneGeoHashNameCount: PhoneGeoHashNameCountNew[] = [];

    constructor(fileContent: string) {
        this.tableData = fileContent;
    }

    private analyseDataValues() {
        //把每一行都分出来
        let lines = this.tableData.split(/\r?\n/);
        let header = lines.shift();

        //再分出每一行的每个字段
        // @ts-ignore
        let tableColumns = header.split(',');

        tableColumns.forEach(column => {
            this.headers.push(column);
        });

        lines.forEach(line => {
            //去掉双引号
            //let rowValues: string[] = [];
            let rowValues: RowData = {row:[]};
            line.split(',').forEach(data => {
                let tmp = data;
                tmp = tmp.substring(0, 1) === "\"" ? tmp.substring(1, tmp.length - 1).trim() : tmp.trim();
                tmp = tmp.substring(tmp.length - 1) === "\"" ? tmp.substring(0, tmp.length - 1).trim() : tmp.trim();
                rowValues.row.push(tmp);

            });
            this.rowsFromFile.push(rowValues);

        });

        //this.rows.shift();

    }

    handleContents(){

        this.analyseDataValues();

        let headerIndex = {} as Headerindex;
        headerIndex.numberIndex = this.headers.indexOf(this.selectedNumbers);
        headerIndex.dateIndex = this.headers.indexOf(this.selectedDateTime);
        headerIndex.geohashIndex = this.headers.indexOf(this.selectedGEOHASH);
        //添加一栏基站名称
        headerIndex.baseName = this.headers.indexOf(this.selectedBashName);

        setTimeout(() => {

            //把最后一行排除掉，不然会报错。
            //这里执行了两个操作，一个是按时间和号码排序，另一个是把最后的无效行去掉.
            this.rowsFromFile.filter(t => t.row.length > 1).sort((a, b) =>
                a.row[headerIndex.numberIndex].localeCompare(b.row[headerIndex.numberIndex]) ||
                (new Date (a.row[headerIndex.dateIndex])).getTime() - (new Date (b.row[headerIndex.dateIndex])).getTime() ).forEach(rows =>{
                this.doTheTimeCalculating(headerIndex, rows.row);
                this.doGeoHashNameCalculation(headerIndex, rows.row);
            });

            //遇到最后一个是新的GEOHASH时，该条记录的endtime会是空值，将begintime值回填回去.
            if(this.resultPhonesGeoHashDataTime[this.resultPhonesGeoHashDataTime.length - 1].endTime === ""){
                this.resultPhonesGeoHashDataTime[this.resultPhonesGeoHashDataTime.length - 1].endTime =
                    this.resultPhonesGeoHashDataTime[this.resultPhonesGeoHashDataTime.length - 1].beginTime
            }

            this.matchTwoResult();
            console.log(this.resultPhonesGeoHashDataTime)

        }, 500)

    }

   private matchTwoResult():void {

        this.resultPhonesGeoHashDataTime.forEach(e => {

            //找出基站名称结果集中同样geohash的结果集
            let tmp = this.resultPhoneGeoHashNameCount.filter(f => {
                return (f.geoHash === e.geoHash && f.phone === e.phone)
            });

            //没有找到该geohash，大概率这个geohash的中文基站名字为空
            // 那么就跳过
            if (tmp.length > 0) {
                tmp.sort((g1, g2) => {
                    return g1.baseNameCount < g2.baseNameCount ? 1 : -1
                });
                e.geoHashName = tmp[0].baseName;

            }
        });
    }


   private doGeoHashNameCalculation(headerIndex: Headerindex, row: string[]) {

        //找到相应的数据结构，没有的话就新建一个加入到队例里，或者是map里
        //在基站名称中去掉为空的基站名称
        //console.log(row[headerIndex.baseName].trim());

        if (row[headerIndex.baseName].trim().length > 0) {
            let findPhoneGeoHashName = this.resultPhoneGeoHashNameCount.find(e => {
                return (
                    e.geoHash === row[headerIndex.geohashIndex].trim() &&
                    e.phone == row[headerIndex.numberIndex].trim() &&
                    e.baseName === row[headerIndex.baseName].trim()
                )
            });

            if (findPhoneGeoHashName == null) {
                //this.initNewPhoneGeoHashName(row[headerIndex.baseName].trim());

                this.resultPhoneGeoHashNameCount.push({
                    "phone": row[headerIndex.numberIndex].trim(),
                    "geoHash":row[headerIndex.geohashIndex].trim(),
                    "baseName": row[headerIndex.baseName].trim(),
                    "baseNameCount":1
                })

            } else {
                findPhoneGeoHashName.baseNameCount += 1;
            }
        }


    }

   private doTheTimeCalculating(headerIndex: Headerindex, row: string[]):void {

        //console.log(row.length)

        this.currentCalculate.phone = row[headerIndex.numberIndex].trim();
        this.currentCalculate.geoHash = row[headerIndex.geohashIndex].trim();
        this.currentCalculate.inDateTime = row[headerIndex.dateIndex].trim();


        ////上下两条如果用户号码与geohash相等，说明是同一个geohash中，需要累计时间
        //加入了用户号码的判断，如果与上面的用户号码不一样，说明是新的号码要加入结果数组中.
        if (typeof (this.preCalculate.phone) !== "undefined" &&
            this.currentCalculate.phone === this.preCalculate.phone &&
            this.currentCalculate.geoHash === this.preCalculate.geoHash){
            this.findValue = this.currentCalculate;
        }
        else { //上下两条如果用户号码与geohash不相等，说明切换了，把Current入库，把pre的值填回去
            this.findValue = this.preCalculate;

            this.resultPhonesGeoHashDataTime.push({
                "phone": this.currentCalculate.phone,
                "geoHash": this.currentCalculate.geoHash,
                "beginTime": this.currentCalculate.inDateTime,
                "endTime": "",
                "interval": 0,
                "geoHashName": ""})
        }

        if (Object.keys(this.findValue).length !== 0){
            let findPhoneGeoHash = this.resultPhonesGeoHashDataTime.filter(e => {
                return (e.phone === this.findValue.phone && e.geoHash === this.findValue.geoHash)
            });
            //如果有找到之前存在的结果，则在最后一个结果上进行操作
            if(findPhoneGeoHash.length > 0){
                findPhoneGeoHash[findPhoneGeoHash.length - 1].endTime = this.findValue.inDateTime
                findPhoneGeoHash[findPhoneGeoHash.length - 1].interval = Math.round(Math.abs( (new Date(findPhoneGeoHash[findPhoneGeoHash.length - 1].endTime).getTime()
                        - new Date(findPhoneGeoHash[findPhoneGeoHash.length - 1].beginTime).getTime() ))
                    / (1000 * 60))
            }
        }

        this.preCalculate.inDateTime = this.currentCalculate.inDateTime;
        this.preCalculate.phone = this.currentCalculate.phone;
        this.preCalculate.geoHash = this.currentCalculate.geoHash;

    }

}
