import React, { useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { Camera, CameraResultType } from '@capacitor/camera';

function App() {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const calculateBMI = async () => {
    if (height && weight && height > 0 && height < 250 && weight > 0 && weight < 300) {
      const heightInMeters = height / 100;
      const calculatedBmi = weight / (heightInMeters * heightInMeters);
      setBmi(calculatedBmi);

      let category = '';
      if (calculatedBmi < 18.5) {
        category = 'Gầy';
      } else if (calculatedBmi < 25) {
        category = 'Bình thường';
      } else if (calculatedBmi < 30) {
        category = 'Thừa cân';
      } else {
        category = 'Béo phì';
      }
      setBmiCategory(category);

      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Chỉ số BMI của bạn',
            body: `BMI: ${calculatedBmi.toFixed(2)}, ${category}`,
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    }
  };

  const shareBMI = async () => {
    if (bmi !== null) {
      await Share.share({
        title: 'Chỉ số BMI',
        text: `BMI: ${bmi.toFixed(2)}, ${bmiCategory}`,
        dialogTitle: 'Chia sẻ kết quả BMI',
      });
    }
  };

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({ resultType: CameraResultType.Uri });
    setImageSrc(photo.webPath || null);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Tính BMI</h1>
      <input
        type="number"
        placeholder="Chiều cao (cm)"
        value={height ?? ''}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value > 0 && value < 250) setHeight(value);
        }}
      />
      <br /><br />
      <input
        type="number"
        placeholder="Cân nặng (kg)"
        value={weight ?? ''}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value > 0 && value < 300) setWeight(value);
        }}
      />
      <br /><br />
      <button onClick={calculateBMI}>Tính BMI</button>
      {bmi !== null && (
        <div>
          <h2>BMI: {bmi.toFixed(2)}</h2>
          <p>Phân loại: {bmiCategory}</p>
          <button onClick={shareBMI}>Chia sẻ kết quả</button>
          <button onClick={takePhoto}>Chụp ảnh</button>
          {imageSrc && <img src={imageSrc} alt="Ảnh chụp" style={{ maxWidth: '200px', marginTop: '10px' }} />}
        </div>
      )}
    </div>
  );
}

export default App;