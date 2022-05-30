import {Controller, Get, HttpStatus, Res} from '@nestjs/common';
import {Response} from "express";

@Controller('api')
export class ApiController {

    @Get()
    findAll(@Res() res: Response){
        res.status(HttpStatus.OK).json({"res":"HelloApi"})
    }

}
