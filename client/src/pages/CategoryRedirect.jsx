import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoryApi } from '../lib/api';

export default function CategoryRedirect() {
  const { id }   = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    categoryApi.getById(id)
      .then((res) => {
        const cat     = res.category || res;
        const section = cat?.section || 'women';
        navigate(`/shop?section=${section}&category=${id}`, { replace: true });
      })
      .catch(() => {
        navigate(`/shop?category=${id}`, { replace: true });
      });
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
