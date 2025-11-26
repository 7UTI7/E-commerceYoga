import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createArticleComment, createVideoComment, type Comment } from "../../lib/api";
import { Button } from "./ui/button";
import { User } from "lucide-react";

interface CommentsSectionProps {
    postId: string;
    kind: 'article' | 'video';
    initialComments: Comment[];
}

export default function CommentsSection({ postId, kind, initialComments }: CommentsSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            let createdComment;
            if (kind === 'article') {
                createdComment = await createArticleComment(postId, newComment);
            } else {
                createdComment = await createVideoComment(postId, newComment);
            }
            setComments([createdComment, ...comments]);
            setNewComment("");
        } catch (error) {
            console.error("Erro ao comentar:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mt-8">
            <h3 className="text-purple-900 mb-6 text-xl font-semibold">Comentários</h3>

            {/* Área de Criar Comentário */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-4 items-start">
                        {/* FOTO DO USUÁRIO LOGADO */}
                        <div className="shrink-0">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-purple-100" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <User className="w-6 h-6" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <textarea
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                                rows={3}
                                placeholder={`Deixe seu comentário como ${user.name}...`}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="mt-2 flex justify-end">
                                <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg" disabled={loading || !newComment.trim()}>
                                    {loading ? "Publicando..." : "Publicar Comentário"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                    Faça login para participar da conversa.
                </div>
            )}

            {/* Lista de Comentários */}
            <div className="space-y-6">
                {comments.map((comment, idx) => (
                    <div key={comment._id || idx} className="flex gap-4">
                        <div className="shrink-0">
                            {comment.author && comment.author.avatar ? (
                                // FOTO DO AUTOR DO COMENTÁRIO
                                <img src={comment.author.avatar} alt={comment.author.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                            ) : (
                                // INICIAL DO NOME
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                    {comment.author?.name?.charAt(0).toUpperCase() || "?"}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{comment.author?.name || "Usuário"}</span>
                                <span className="text-xs text-gray-500">
                                    {comment.createdAt && new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && <p className="text-gray-500 italic">Seja o primeiro a comentar!</p>}
            </div>
        </div>
    );
}