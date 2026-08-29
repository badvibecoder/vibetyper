package threading

import "core:sync"
import "core:sync/atomic"
import "core:thread"
import "core:thread/channel"
import "core:time"

Worker_Context :: struct {
	job_ch:    channel.Chan(int),
	result_ch: channel.Chan(int),
}

Half_Context :: struct {
	values: []int,
	result: int,
}

Counter_Context :: struct {
	mutex:   ^sync.Mutex,
	counter: ^int,
}

Safe_Cache :: struct {
	mutex:   sync.Mutex,
	entries: map[string]int,
}

// spawn_worker starts a procedure on a new thread.
spawn_worker :: proc(worker: proc(), label: string) -> (^thread.Thread, bool) {
	t := thread.create(worker)
	if t == nil {
		return nil, false
	}
	t.name = label
	thread.start(t)
	return t, true
}

// join_worker waits for a worker thread to finish.
join_worker :: proc(t: ^thread.Thread) -> bool {
	if t == nil {
		return false
	}
	thread.join(t)
	return true
}

// release_worker cleans up a finished thread handle.
release_worker :: proc(t: ^thread.Thread) {
	if t != nil {
		thread.destroy(t)
	}
}

// mutex_counter_increment bumps a shared counter under a mutex.
mutex_counter_increment :: proc(mutex: ^sync.Mutex, counter: ^int) {
	sync.mutex_lock(mutex)
	counter^ += 1
	sync.mutex_unlock(mutex)
}

// mutex_counter_read reads a counter safely under a mutex.
mutex_counter_read :: proc(mutex: ^sync.Mutex, counter: ^int) -> int {
	sync.mutex_lock(mutex)
	value := counter^
	sync.mutex_unlock(mutex)
	return value
}

// atomic_counter_increment bumps a counter without a lock.
atomic_counter_increment :: proc(counter: ^int) {
	atomic.add(counter, 1)
}

// channel_send pushes a value into a thread channel.
channel_send :: proc(ch: channel.Chan(int), value: int) -> bool {
	ok := channel.send(ch, value)
	return ok
}

// channel_receive blocks until a value arrives from a channel.
channel_receive :: proc(ch: channel.Chan(int)) -> (int, bool) {
	value, ok := channel.recv(ch)
	return value, ok
}

// channel_try_receive polls a channel without blocking.
channel_try_receive :: proc(ch: channel.Chan(int)) -> (int, bool) {
	value, ok := channel.recv_non_blocking(ch)
	return value, ok
}

// worker_pool_run processes jobs across a fixed set of workers.
worker_pool_run :: proc(jobs: []int, worker_count: int) -> int {
	results := make([dynamic]int)
	defer delete(results)
	job_ch := channel.make(chan(int), 8)
	defer channel.destroy(job_ch)
	result_ch := channel.make(chan(int), 8)
	defer channel.destroy(result_ch)
	worker :: proc(data: rawptr) {
		ctx := cast(^Worker_Context)data
		for {
			job, ok := channel.recv(ctx.job_ch)
			if !ok {
				return
			}
			channel.send(ctx.result_ch, job * job)
		}
	}
	contexts := make([]Worker_Context, worker_count)
	defer delete(contexts)
	for i in 0 ..< worker_count {
		contexts[i] = Worker_Context{job_ch = job_ch, result_ch = result_ch}
		thread.create_and_start(worker, &contexts[i])
	}
	for job in jobs {
		channel.send(job_ch, job)
	}
	channel.close(job_ch)
	total := 0
	for i in 0 ..< len(jobs) {
		value, _ := channel.recv(result_ch)
		total += value
	}
	return total
}

// parallel_sum splits a slice and sums the halves in two threads.
parallel_sum :: proc(values: []int) -> int {
	if len(values) < 4096 {
		return sum(values)
	}
	mid := len(values) / 2
	left_result: int
	right_result: int
	half_sum :: proc(ctx: rawptr) {
		c := cast(^Half_Context)ctx
		c.result = sum(c.values)
	}
	ctx_left := Half_Context{values = values[:mid]}
	ctx_right := Half_Context{values = values[mid:]}
	t1 := thread.create_and_start(half_sum, &ctx_left)
	t2 := thread.create_and_start(half_sum, &ctx_right)
	thread.join(t1)
	thread.join(t2)
	return ctx_left.result + ctx_right.result
}

// once_run executes an initializer exactly once.
once_run :: proc(once: ^sync.Once, initializer: proc()) {
	sync.once_init(once, initializer)
}

// safe_cache_set stores a value under a mutex-protected map.
safe_cache_set :: proc(cache: ^Safe_Cache, key: string, value: int) {
	sync.mutex_lock(&cache.mutex)
	cache.entries[key] = value
	sync.mutex_unlock(&cache.mutex)
}

// safe_cache_get fetches a value from a thread-safe map.
safe_cache_get :: proc(cache: ^Safe_Cache, key: string) -> (int, bool) {
	sync.mutex_lock(&cache.mutex)
	defer sync.mutex_unlock(&cache.mutex)
	value, ok := cache.entries[key]
	return value, ok
}

// barrier_wait synchronizes a fixed group of threads.
barrier_wait :: proc(barrier: ^sync.Barrier) {
	sync.barrier_wait(barrier)
}

// run_after_ms sleeps the current thread for a duration.
run_after_ms :: proc(ms: f64) {
	thread.sleep(time.Duration(ms) * time.Millisecond)
}

// worker_counter_start spawns N threads that bump a shared counter.
worker_counter_start :: proc(mutex: ^sync.Mutex, counter: ^int, worker_count: int) -> [dynamic]^thread.Thread {
	workers := make([dynamic]^thread.Thread, worker_count)
	for i in 0 ..< worker_count {
		w := thread.create_and_start(
			proc(data: rawptr) {
				ctx := cast(^Counter_Context)data
				for j in 0 ..< 1000 {
					mutex_counter_increment(ctx.mutex, ctx.counter)
				}
			},
			&Counter_Context{mutex = mutex, counter = counter},
		)
		append(&workers, w)
	}
	return workers
}

// wait_all joins every thread in a slice.
wait_all :: proc(workers: []^thread.Thread) {
	for w in workers {
		thread.join(w)
	}
}

// semaphore_gate limits concurrent access to a resource.
semaphore_gate :: proc(sem: ^sync.Semaphore, run: proc()) {
	sync.semaphore_wait(sem)
	defer sync.semaphore_post(sem)
	run()
}

// current_thread_id returns a numeric id for the calling thread.
current_thread_id :: proc() -> u64 {
	return u64(uintptr(thread.current_thread()))
}

// is_main_thread detects the primary thread by saved id.
is_main_thread :: proc(main_id: u64) -> bool {
	return current_thread_id() == main_id
}
