CampPlannerBackend

Backend is deployed and live at 54.87.191.138:3000.

To run locally:

    create an .env file in the project root. Enter your AWS keys, region, JWT secret, and Recreation.gov API key. 

        AWS_ACCESS_KEY_ID=
        AWS_SECRET_ACCESS_KEY=
        AWS_REGION=
        PORT=3000
        JWT_SECRET=
        RIDB_API_KEY=
        NODE_ENV=development

    execute command: npm run dev
    to test: npm test 
    with coverage: npm test -- --coverage
    build: npm run build