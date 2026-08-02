/**
 * Task feature slice: create/queue, list (search, filter, sort, paginate),
 * detail with logs, update-while-pending, delete, retry, and dashboard stats.
 * Controller &rarr; service &rarr; repository; queueing is delegated to
 * {@link ai.taskforge.queue}.
 */
package ai.taskforge.feature.task;
