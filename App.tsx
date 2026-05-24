/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateCard from './pages/CreateCard';
import ProfileCard from './pages/ProfileCard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateCard />} />
        <Route path="/:hash" element={<ProfileCard />} />
      </Routes>
    </Router>
  );
}
