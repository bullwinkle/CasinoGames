import "styles/index.scss";
import { App } from './app/app.js';


const app = new App();
window.app = app;
window.ENV = process.env;

app.start();
