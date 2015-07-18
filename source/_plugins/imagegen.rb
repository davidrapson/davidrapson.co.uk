require 'digest/md5'
require 'mini_magick'

class ImageGen

  def self.generate(instance, site_source, site_dest, image_source, image_dest, baseurl)

    image = MiniMagick::Image.open(File.join(site_source, image_source, instance[:src]))
    digest = Digest::MD5.hexdigest(image.to_blob).slice!(0..5)

    image_dir = File.dirname(instance[:src])
    ext = File.extname(instance[:src])
    basename = File.basename(instance[:src], ext)

    orig_width = image[:width].to_f
    orig_height = image[:height].to_f
    orig_ratio = orig_width/orig_height

    gen_width = if instance[:width]
      instance[:width].to_f
    elsif instance[:height]
      orig_ratio * instance[:height].to_f
    else
      orig_width
    end

    gen_height = if instance[:height]
      instance[:height].to_f
    elsif instance[:width]
      instance[:width].to_f / orig_ratio
    else
      orig_height
    end

    gen_ratio = gen_width/gen_height

    # Don't allow upscaling.
    # If the image is smaller than the requested dimensions, recalculate.
    if orig_width < gen_width || orig_height < gen_height
      undersize = true
      gen_width = if orig_ratio < gen_ratio then orig_width else orig_height * gen_ratio end
      gen_height = if orig_ratio > gen_ratio then orig_height else orig_width/gen_ratio end
    end

    gen_name = "#{basename}-#{gen_width.round}by#{gen_height.round}-#{digest}#{ext}"
    gen_dest_dir = File.join(site_dest, image_dest, image_dir)
    gen_dest_file = File.join(gen_dest_dir, gen_name)

    # Generate resized files
    unless File.exists?(gen_dest_file)

      warn %{
        Warning: #{instance[:src]} is smaller than the requested output file.
        It will be resized without upscaling."
      } if undersize

      #  If the destination directory doesn't exist, create it
      FileUtils.mkdir_p(gen_dest_dir) unless File.exist?(gen_dest_dir)

      # Let people know their images are being generated
      puts "Generating #{gen_name}"

      # Scale and crop
      image.combine_options do |i|
        i.resize "#{gen_width}x#{gen_height}^"
        i.gravity "center"
        i.crop "#{gen_width}x#{gen_height}+0+0"
      end

      image.write gen_dest_file

    end

    # Return path relative to the site root for html
    Pathname.new(File.join(baseurl, image_dest, image_dir, gen_name)).cleanpath

  end

end
