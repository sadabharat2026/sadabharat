import api from './api';
import { resolveUploadedUrl } from './productImages';

export const uploadImageFiles = async (files) => {
  const list = Array.from(files || []).filter(Boolean);
  if (!list.length) return [];

  const urls = [];
  for (let i = 0; i < list.length; i += 5) {
    const chunk = list.slice(i, i + 5);
    const formData = new FormData();
    chunk.forEach((file) => formData.append('documents', file));

    const res = await api.post('/upload', formData, { timeout: 60000 });
    if (!res.data?.success || !Array.isArray(res.data.data) || !res.data.data.length) {
      throw new Error('Upload failed on server.');
    }
    urls.push(...res.data.data.map(resolveUploadedUrl).filter(Boolean));
  }
  return urls;
};
