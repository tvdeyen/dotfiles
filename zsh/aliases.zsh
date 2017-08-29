alias reload!='. ~/.zshrc'

alias cls='clear' # Good 'ol Clear Screen command
alias code='cd ~/code'
alias gtaf='cd ~/code/alchemy_cms'
alias test_alchemy='rm Gemfile.lock; bundle install; bundle exec rake alchemy:spec:prepare; bundle exec rspec'
alias less='less -R'
alias git-clean-up="git branch --merged | grep -v -e 'master' -e '\*' | xargs -n 1 git branch -d && git remote prune origin"
alias candles='cd ~/code/candlescience/CSpree'
alias beer='bundle exec rspec'
