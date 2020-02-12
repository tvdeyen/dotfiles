alias reload!='. ~/.zshrc'

alias cls='clear' # Good 'ol Clear Screen command
alias gtcf='cd ~/code'
alias gtaf='cd ~/code/alchemy_cms'
alias gtb1='cd ~/code/brandeins/kiosk'
alias test_alchemy='rm Gemfile.lock; bundle install; bundle exec rake alchemy:spec:prepare; bundle exec rspec'
alias less='less -R'
alias git-clean-up="git branch --merged | grep -v -e 'master' -e '\*' | xargs -n 1 git branch -d && git remote prune origin"
alias candles='cd ~/code/candlescience/CSpree'
alias beer='bundle exec rspec'
alias brake='bundle exec rake'

alias l='ls -hal --color'
alias copy='rsync -avuh --delete --progress'
