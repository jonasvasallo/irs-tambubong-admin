import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import "../../styles/settingspage.css";
import IncidentTagsSection from './components/IncidentTagsSection';
import RolesSection from './components/RolesSection';
import StreetsSection from './components/StreetsSection';

const SettingsPage = () => {
  const [selectedSection, setSelectedSection] = useState('IncidentTags');

  const renderSection = () => {
    switch (selectedSection) {
      case 'IncidentTags':
        return <IncidentTagsSection />;
      case 'Roles':
        return <RolesSection />;
      case 'Streets':
        return <StreetsSection />;
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <>
      <div className="content">
        <Sidebar />
        <div className="main-content">
          <Header title="Settings" />
          <div className="content-here">
            <div className="container w-100" style={{ padding: '0' }}>
              <div className="flex main-between h-100">
                <div id="side-actions" className='flex-1 h-100 flex main-end'>
                  <div className="flex col gap-8" style={{ width: '100%', maxWidth: '60%' }}>
                    <br />
                    <span className="subheading-s color-major">Tambubong IRS</span>
                    <br />
                    <button
                      className={`side-button ${selectedSection === 'IncidentTags' ? 'selected' : ''}`}
                      onClick={() => setSelectedSection('IncidentTags')}
                    >
                      Incident Tags
                    </button>
                    <button
                      className={`side-button ${selectedSection === 'Roles' ? 'selected' : ''}`}
                      onClick={() => setSelectedSection('Roles')}
                    >
                      Roles
                    </button>
                    <button
                      className={`side-button ${selectedSection === 'Streets' ? 'selected' : ''}`}
                      onClick={() => setSelectedSection('Streets')}
                    >
                      Streets
                    </button>
                  </div>
                </div>
                <div className="flex col flex-3 pad-16">
                  {renderSection()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
