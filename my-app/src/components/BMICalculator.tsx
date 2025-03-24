import React, { useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import '../App.css';

interface BMICalculatorProps {}

interface BMIResult {
  value: number | null;
  evaluation: string;
}

const BMICalculator: React.FC<BMICalculatorProps> = () => {
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [bmiResult, setBMIResult] = useState<BMIResult>({ value: null, evaluation: '' });
  const [capturedImage, setCapturedImage] = useState<string | null | undefined>(null);

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHeight(value === '' ? null : parseFloat(value) || null);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeight(value === '' ? null : parseFloat(value) || null);
  };

  const calculateBMI = () => {
    if (height && weight && height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      const roundedBMI = parseFloat(bmi.toFixed(2));
      let evaluation = '';

      if (roundedBMI < 18.5) {
        evaluation = 'Gầy';
      } else if (roundedBMI >= 18.5 && roundedBMI <= 24.9) {
        evaluation = 'Bình thường';
      } else if (roundedBMI >= 25 && roundedBMI <= 29.9) {
        evaluation = 'Thừa cân';
      } else {
        evaluation = 'Béo phì';
      }

      const result = { value: roundedBMI, evaluation };
      setBMIResult(result);
      showNotification(result);
    } else {
      alert('Vui lòng nhập chiều cao và cân nặng hợp lệ.');
    }
  };

  const showNotification = async (result: BMIResult) => {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Kết quả BMI',
          body: `Chỉ số BMI của bạn là: ${result.value} (${result.evaluation})`,
          id: 1,
          schedule: { at: new Date(Date.now() + 1000) },
        },
      ],
    });
  };


  const shareResult = async () => {
    if (bmiResult.value) {
      await Share.share({
        title: 'Kết quả BMI',
        text: `Chỉ số BMI của tôi là: ${bmiResult.value} (${bmiResult.evaluation})`,
      });
    } else {
      alert('Chưa có kết quả BMI để chia sẻ.');
    }
  };

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      console.log('Image URI:', image.webPath);
      setCapturedImage(image.webPath);

    } catch (error) {
      console.error('Lỗi khi chụp ảnh:', error);
    }
  };


  return (
    <div className="container">
      <h1>Tính BMI</h1>
      <div className="input-group">
        <label htmlFor="height">Chiều cao (cm):</label>
        <input
          type="number"
          id="height"
          value={height === null ? '' : height}
          onChange={handleHeightChange}
          className="input-field"
        />
      </div>
      <div className="input-group">
        <label htmlFor="weight">Cân nặng (kg):</label>
        <input
          type="number"
          id="weight"
          value={weight === null ? '' : weight}
          onChange={handleWeightChange}
          className="input-field"
        />
      </div>
      <button onClick={calculateBMI} className="calculate-button">Tính BMI</button>

      <button onClick={takePicture} className="camera-button">Chụp ảnh</button>

      {capturedImage && (
        <div className="image-preview">
          <h2>Ảnh đã chụp:</h2>
          <img src={capturedImage} alt="Ảnh người dùng" style={{ maxWidth: '200px' }} />
        </div>
      )}

      {bmiResult.value !== null && (
        <div className="result">
          <h2>Kết quả</h2>
          <p>Chỉ số BMI: <span className="bmi-value">{bmiResult.value}</span></p>
          <p>Đánh giá: <span className="bmi-evaluation">{bmiResult.evaluation}</span></p>
          <button onClick={shareResult} className="share-button">Chia sẻ kết quả</button>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;