请使用英文注释，英文静态页面字段

All commit messages must follow this format: <type>: <brief description>.
1.5.1 Types:
feat: A new feature
fix: A bug fix
docs: Documentation changes
style: Code style changes (non-functional)
refactor: Code refactoring (neither adding features nor fixing bugs)
test: Adding tests
chore: Changes to the build process or auxiliary tools
1.5.2 Examples:
feat: Add user login functionality
fix: Fix login page styling issues
1.5.3 For more details, refer to: Conventional Commits.
2. Conflict Resolution
2.1 Use git pull to fetch the latest remote branch.
2.2 Use git status to identify files with conflicts.
2.3 Open the conflicting files; you will see conflict markers like this:
<<<<<<< HEAD
Your changes
=======
Remote changes
>>>>>>> branch_name
Manually edit these files, keeping the necessary changes and removing the conflict
markers.
2.4 After resolving the conflicts, mark these files as resolved using git add
<filename>.
2.5 Once all conflicts are resolved, commit the merge with git commit -m
"Resolved merge conflict".
2.6 If you were merging a branch, continue with the merge after resolving
conflicts. If you were pulling remote changes and resolving conflicts, push the code
with git push.
2.7 Finally, run your project or test the code to ensure that no new issues
were introduced during the merge.