import { handlerPath } from '@libs/handler-resolver';
import { FOLDER } from '@utils/constants';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: '${self:provider.environment.BUCKET_NAME}',
        event: 's3:ObjectCreated:*',
        existing: true,
        rules: [
          { prefix: `${FOLDER.UPLOADED_FILES}/`},
        ]
      }
    }
  ]
};
