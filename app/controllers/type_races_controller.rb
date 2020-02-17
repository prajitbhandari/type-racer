class TypeRacesController < ApplicationController
  # access all: [:show, :index], user: {except: [:destroy]}, company_admin: :all
  def index
    # @type_race = TypeRace.all.sample
  end

  def show
    #Get template_id same as race_template_id
    @type_race = TypeRace.find(params[:id])
    @templates = RaceTemplate.find_by_id(@type_race.race_templates_id)
    # @type_race_stat = @type_race.type_race_stats.find_by(user_id: current_user.id)
    # @users = TypeRace.last.users
  end

  def create_or_join
    pending_race = TypeRace.pending.last
    if pending_race
      pending_race.users << User.all
      pending_race.update(status: "ongoing")
      redirect_to type_race_path(pending_race)
    else
      @templates = RaceTemplate.all.sample
      @type_race = TypeRace.create(race_templates_id: @templates.id, status: "pending")
      redirect_to type_race_path(@type_race)
    end
  end

  def poll
    @type_race = TypeRace.find(params[:id])
    respond_to do |format|
      format.json { render json: { stat: @type_race.type_race_stats }, status: :ok}
    end
  end

  def update
    @type_racer = TypeRace.find(params[:id])
    respond_to do |format|
      if @type_racer.type_race_stats.find_by(user_id: current_user.id).update_attributes(text_area: type_racer_params[:text_area], wpm: type_racer_params[:wpm])
        format.json { render json: { stat: @type_racer.type_race_stats}, status: :ok}
      end
    end
  end

  private
  def  type_racer_params
    params.permit(:text_area, :user_id, :type_race_id, :wpm, :status)
  end

  def time_count
    # time_count_in_seconds = 0
    10.downto(0) do |index|
      sleep 1
      # time_count_in_seconds =index
      if index > 3
        return true
      end
    end
  end
end

