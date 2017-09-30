import "styles/index.scss";
import { App } from './app/app.js';


const app = new App();
app.start();
window.app = app;
window.ENV = process.env;
