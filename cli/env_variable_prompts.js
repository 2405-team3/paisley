const ENV_VARIABLES = [
    {
      type: 'input',
      name: 'PAISLEY_ADMIN_USERNAME',
      message: 'Enter a name to use for your Paisley admin account:',
    },
    {
      type: 'input',
      name: 'PAISLEY_ADMIN_PASSWORD',
      message: 'Enter a password to use for your Paisley admin account:',
    },
    {
      type: 'input',
      name: 'OPENAI_API_KEY',
      message: 'Enter your OPENAI API key:',
    },
    {
      type: 'input',
      name: 'LLAMA_CLOUD_API_KEY',
      message: 'Enter your LLAMA Cloud API key:',
    },
    {
      type: 'input',
      name: 'AWS_IDENTIFIER',
      message: 'Enter an identifier to be included in deployed AWS infrastructure:',
    },
    {
      type: 'input',
      name: 'PG_DATABASE',
      message: 'Select a database name for your PostgreSQL RDS:',
    },
    {
      type: 'input',
      name: 'PG_ADMINPW',
      message: 'Select an admin password for your PostgreSQL RDS:',
    },
    {
      type: 'input',
      name: 'PG_USER',
      message: 'Select a username for your PostgreSQL RDS:',
    },
    {
      type: 'input',
      name: 'PG_PASSWORD',
      message: 'Select a password for your PostgreSQL RDS:',
    },
    {
      type: 'input',
      name: 'MONGO_USERNAME',
      message: 'Select a username for your MongoDB DocDB:',
    },
    {
      type: 'input',
      name: 'MONGO_PASSWORD',
      message: 'Select a password for your MongoDB Password:',
    },
    {
      type: 'input',
      name: 'AWS_KEY_PAIR_NAME',
      message: 'Select the name of the AWS key pair you will use (not including file extension):',
    },
    {
      type: 'input',
      name: 'AWS_PEM_PATH',
      message: 'Enter the path to your AWS pem key file:',
    },
  ];
  
  export default ENV_VARIABLES;