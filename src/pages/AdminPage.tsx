import React, { useState } from 'react';
import AdminPanel from '../components/AdminPanel';
import AddCertificationModal from '../components/AddCertificationModal';

export const AdminPage: React.FC = () => {
  const [isAddCertificationModalOpen, setIsAddCertificationModalOpen] = useState(false);

  const handleAddCertification = () => {
    setIsAddCertificationModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddCertificationModalOpen(false);
  };

  const handleCertificationSuccess = () => {
    // Aquí podrías refrescar datos o mostrar notificaciones
    console.log('Certificación agregada exitosamente');
  };

  return (
    <div className="h-screen bg-gray-50">
      <AdminPanel onAddCertification={handleAddCertification} />
      
      <AddCertificationModal
        isOpen={isAddCertificationModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCertificationSuccess}
      />
    </div>
  );
};