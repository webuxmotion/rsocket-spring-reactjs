import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Catalog from './pages/catalog/Catalog.container';
import Demo from './pages/demo/Demo';

export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Main</Link>
            </li>
            <li>
              <Link to="/catalog">Catalog</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/catalog">
            <Catalog />
          </Route>
          <Route path="/">
            <Demo />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}