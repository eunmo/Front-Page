use LWP::Simple;
use feature 'unicode_strings';
use utf8;
use Encode;
use Mojo::DOM;
use Mojo::Collection;
use DateTime;
binmode(STDOUT, ":utf8");

my $date = $ARGV[0];
$date =~ /^(.{4})(.{2})(.{2})/;
$date = "$1/$2/$3";
my $url = "http://www.nytimes.com/indexes/$date/todayspaper/index.html";
my $html = get("$url");
my $dom = Mojo::DOM->new($html);

my $json = "[";
my $count = 0;

for my $h3 ($dom->find('div[class="aColumn"] div[class^="story"] h3')->each) {
	my $a = $h3->find('a')->first;
	my $href = $a->attr('href');
	my $title = $a->all_text;
	$href =~ s/https:\/\/www.nytimes.com//;

	$json .= "," if $count++;
	$json .= "{\"href\": \"$href\", \"title\": \"$title\"}";
}

$json .= "]";
print $json;
