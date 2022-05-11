# NEXUS Backend Documentation
> For more information: https://docs.google.com/document/d/1m1Z3_QX1r0cL__jlKDm_5dZ7Y0-AVCoxTGaJM2EwmYU/edit
## Running the Backend Locally
### Initial Setup & .env file
1. Clone the repository:
```
git clone https://github.com/UW-Nexus-Dev-Team/uw-nexus-backend.git
```
2. Install all dependencies: 
```
npm install
```
3. Create a .env file in the main directory
```
touch .env
```
4. Copy .env file contents from the NEXUS shared google drive and paste it into the newly created .env file
- https://drive.google.com/file/d/1VNscx-Ef5_yzZKC_vDFWiR_O62XJi1-c/view?usp=sharing
### Standard Use:
1. Run the server: 
```
npm run start
```
2. Or, run the server with updates upon save: 
```
nodemon start
```
