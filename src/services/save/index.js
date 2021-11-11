// const { Pool, RowDataPacket } = require('mysql2/promise');
// import * as SQL from './sql';
// const conn = require('../../db/index.js')
//
// export default class SaveService {
//   db = conn;
//
//   constructor(promisePool) {
//     this.db = promisePool;
//   }
//
//   async function getSavedEntityIds(username) {
//     try {
//       const [projectsRes] = await this.db.execute(SQL.getSavedProjects, [username]);
//       const [studentsRes] = await this.db.execute(SQL.getSavedStudents, [username]);
//
//       return {
//         projects: (projectsRes as RowDataPacket[]).map(({ projectId }) => String(projectId)),
//         students: (studentsRes as RowDataPacket[]).map(({ username }) => String(username)),
//       };
//     } catch (err) {
//       throw err;
//     }
//   }
//
//   async function saveProject(username, projectId) {
//     try {
//       await this.db.execute(SQL.saveProject, [username, projectId]);
//     } catch (err) {
//       throw err;
//     }
//   }
//
//   async function unsaveProject(username, projectId) {
//     try {
//       await this.db.execute(SQL.unsaveProject, [username, projectId]);
//     } catch (err) {
//       throw err;
//     }
//   }
//
//   async function saveStudent(username, targetUsername) {
//     try {
//       await this.db.execute(SQL.saveStudent, [username, targetUsername]);
//     } catch (err) {
//       throw err;
//     }
//   }
//
//   async function unsaveStudent(username, targetUsername) {
//     try {
//       await this.db.execute(SQL.unsaveStudent, [username, targetUsername]);
//     } catch (err) {
//       throw err;
//     }
//   }
// }
