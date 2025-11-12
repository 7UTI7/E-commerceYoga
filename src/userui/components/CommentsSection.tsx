import { useState } from 'react';
import { type Comment, createArticleComment, createVideoComment, parseApiError } from '../../lib/api'; // Ajuste o caminho se necessário
import { useAuth } from '../../contexts/AuthContext'; // Ajuste o caminho se necessário
import { Button } from './ui/button'; // Importando o botão do seu design system
import { Link } from 'react-router-dom'; // Para o link de login

// Helper para formatar datas (você pode ajustar)
function formatCommentDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

type Props = {
    // O ID do post (seja article ou video)
    postId: string;
    // O tipo, para sabermos qual API chamar
    kind: 'article' | 'video';
    // A lista de comentários que vem do post-detail.tsx
    initialComments: Comment[];
};

export default function CommentsSection({ postId, kind, initialComments }: Props) {
    const { user } = useAuth(); // Pega o usuário do contexto
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return; // Não envia se estiver vazio ou se (por algum motivo) o usuário não estiver logado

        setIsSubmitting(true);
        setError(null);

        try {
            let createdComment: Comment;
            // Chama a função correta da API com base no 'kind'
            if (kind === 'article') {
                createdComment = await createArticleComment(postId, newComment); //
            } else {
                createdComment = await createVideoComment(postId, newComment); //
            }

            // Adiciona o novo comentário no topo da lista (atualização local)
            setComments([createdComment, ...comments]);
            setNewComment(''); // Limpa a caixa de texto
        } catch (err: any) {
            setError(parseApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mt-8">
            <h3 className="text-2xl font-semibold text-purple-900 mb-6">Comentários</h3>

            {/* --- Formulário de Novo Comentário --- */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex items-start gap-4">
                        {/* Simulação de Avatar - pode ser trocado por uma imagem real do usuário se tiver */}
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {user.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={`Deixe seu comentário como ${user.name}...`}
                                className="w-full rounded-xl border px-3 py-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-200"
                                rows={3}
                                disabled={isSubmitting}
                            />
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            <Button
                                type="submit"
                                disabled={isSubmitting || !newComment.trim()}
                                className="rounded-lg mt-3 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {isSubmitting ? 'Publicando...' : 'Publicar Comentário'}
                            </Button>
                        </div>
                    </div>
                </form>
            ) : (
                // --- Aviso para Fazer Login ---
                <div className="mb-8 p-4 rounded-lg bg-gray-100 text-center text-gray-700">
                    <p>
                        Você precisa estar logado para deixar um comentário.{' '}
                        <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                            Fazer login
                        </Link>
                    </p>
                </div>
            )}

            {/* --- Lista de Comentários Existentes --- */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-gray-500">Ainda não há comentários. Seja o primeiro!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex items-start gap-4">
                            {/* Avatar do autor do comentário */}
                            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold flex-shrink-0">
                                {comment.author.name[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-semibold text-gray-900">{comment.author.name}</span>
                                    <span className="text-xs text-gray-500">
                                        {formatCommentDate(comment.createdAt)}
                                    </span>
                                </div>
                                <p className="text-gray-700 mt-1 whitespace-pre-line">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}