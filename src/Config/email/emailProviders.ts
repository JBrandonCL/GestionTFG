import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        MailerModule.forRoot({
            transport:{
                host: 'smtp.gmail.com',
                port: 465,
                auth:{
                    user:'madmotorlaravel@gmail.com',
                    pass:'LBTORBWATCWCMNVT'
                }
            }
        }),
    ],
    exports: []
})
export class EmailProviders {}