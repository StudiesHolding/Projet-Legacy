import { MultipartFile } from "@adonisjs/core/bodyparser";
import { cuid } from "@adonisjs/core/helpers";

export class UploadFileService {
  async uploadFiles( path:string , file:MultipartFile){
    const uuid = cuid()
    const fileName = `${uuid}.png`

    file.move(`upload/${path}`,{
      name:fileName,
      overwrite:false
    })
  }
}