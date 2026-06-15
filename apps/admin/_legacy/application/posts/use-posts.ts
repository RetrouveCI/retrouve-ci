'use client'

import { useState, useEffect, useCallback } from 'react'
import { postRepository } from '@/infrastructure/repositories/mock-post-repository'
import type { Post, PostStatus } from '@/domain/entities/post'

export function usePosts() {
	const [posts, setPosts] = useState<Post[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		postRepository.getAll().then(data => {
			setPosts(data)
			setIsLoading(false)
		})
	}, [])

	const updateStatus = useCallback(async (id: number, status: PostStatus) => {
		await postRepository.updateStatus(id, status)
		setPosts(prev =>
			prev.map(p =>
				p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p,
			),
		)
	}, [])

	const remove = useCallback(async (id: number) => {
		await postRepository.delete(id)
		setPosts(prev => prev.filter(p => p.id !== id))
	}, [])

	return { posts, isLoading, updateStatus, remove }
}

export function usePost(id: number) {
	const [post, setPost] = useState<Post | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		postRepository.getById(id).then(data => {
			setPost(data)
			setIsLoading(false)
		})
	}, [id])

	const updateStatus = useCallback(
		async (status: PostStatus) => {
			if (!post) return
			await postRepository.updateStatus(post.id, status)
			setPost(prev => (prev ? { ...prev, status } : null))
		},
		[post],
	)

	const remove = useCallback(async () => {
		if (!post) return
		await postRepository.delete(post.id)
		setPost(null)
	}, [post])

	return { post, isLoading, updateStatus, remove }
}
