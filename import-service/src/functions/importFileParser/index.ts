import { handlerPath } from '@libs/handler-resolver';
import { AWS_CONFIG, FOLDER } from '@utils/constants';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: AWS_CONFIG.BUCKET_NAME,
        event: "s3:ObjectCreated:*",
        existing: true,
        rules: [
          { prefix: `${FOLDER.UPLOADED_FILES}/`},
        ]
      }
    }
  ]
};
